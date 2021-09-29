import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { getPrismicClient } from '../../services/prismic';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { RichText } from 'prismic-dom';

interface Post {
  first_publication_date: string | null;
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
  post: Post;
}

export default function Post({post}: PostProps) {
  
  const router = useRouter();

  if(router.isFallback){
    return <h1>Carregando...</h1>
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | Space Traveling</title> 
      </Head>

      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <time>
            {format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            )}
          </time>
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
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const prismic = getPrismicClient();
 
  const { slug } = context.params;
  
  const response = await prismic.getByUID( 'posts', String(slug), {} );

  const post = { 
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
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

  return {
    props: {
      post
    },
    revalidate: 60 * 60, //1 hora
  } 
};
