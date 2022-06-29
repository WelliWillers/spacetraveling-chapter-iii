import { Fragment, useMemo } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  uid: string;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  preview: boolean;
  post: Post;
  nextPost: Post | null;
  prevPost: Post | null;
}

export default function Post({
  preview,
  post,
  nextPost,
  prevPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  const readTime = useMemo(() => {
    if (router.isFallback) {
      return 0;
    }

    const totalWords = post.data.content.reduce((total, contentItem) => {
        total += contentItem.heading.split(' ').length; // all 'heading' words
    
        const words = contentItem.body.map(item => item.text.split(' ').length); // all 'body' words
        words.map(word => (total += word));
    
        return total;
      }, 0);

    const readWordsPerMinute = 200;

    const time = Math.ceil(totalWords / readWordsPerMinute);

    return time;
  }, [post, router.isFallback]);


  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | SpaceTraveling</title>
      </Head>

      <main className={styles.container}>
        <header>
          <img src={post.data.banner.url} alt={post.data.title} />
        </header>
        <section>
          <article className={styles.postContent}>
            <h1>{post.data.title}</h1>
            <div className={styles.postInfos}>
              <time>
                <FiCalendar />
                {format(parseISO(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
              </time>
              <span>
                <FiUser />
                {post.data.author}
              </span>
              <span>
                <FiClock />
                {readTime} min
              </span>
            </div>
           
            <div className={styles.postBody}>
            {post.data.content.map(content => (
              <Fragment key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </Fragment>
            ))}
            </div>
          </article>
          <footer className={styles.navigationController}>
            <div>
              {prevPost && (
                <Link href={`/post/${prevPost.uid}`}>
                  <a>
                    <h4>{prevPost.data.title}</h4>
                    <span>Post anterior</span>
                  </a>
                </Link>
              )}
            </div>
            <div>
              {nextPost && (
                <Link href={`/post/${nextPost.uid}`}>
                  <a>
                    <h4>{nextPost.data.title}</h4>
                    <span>Próximo post</span>
                  </a>
                </Link>
              )}
            </div>
          </footer>
          {preview && (
            <aside className={commonStyles.exitPreviewButton}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )}
        </section>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 2, // posts per page
    }
  );

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  const post = { 
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => {
        return {
          heading: content.heading,
          body: [...content.body],
        };
      }),
    }
  }

  const nextPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date]',
      after: response.id,
    }
  );

  const prevPost = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      pageSize: 1,
      orderings: '[document.first_publication_date desc]',
      after: response.id,
    }
  );

  return {
    props: {
      preview,
      nextPost: nextPost.results[0] ?? null,
      prevPost: prevPost.results[0] ?? null,
      post: post,
    },
    revalidate: 60 * 5, // 5 minutes
  };
};
