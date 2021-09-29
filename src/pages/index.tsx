import Link from 'next/link';
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';


import styles from './home.module.scss';
import { FiCalendar, FiUser } from "react-icons/fi";
import commonStyles from '../styles/common.module.scss';
import { useEffect, useState } from 'react';
import Head from 'next/head';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  // carregando mais posts
  function handleOpenMorePosts () {
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });

        setPosts([...posts, ...formattedData]);
        setNextPage(data.next_page);
      });
  }

  return (
    <>
      <Head>
        <title>Home | Space Traveling</title>
      </Head>
      
      <div className={`${styles.main}`}>
        <main>
          {
            posts.map(post => (
              <Link key={post.uid} href={`/post/${post.uid}`}>
                <a>
                  <article>
                      <strong>{post.data.title}</strong>
                      <p>{post.data.subtitle}</p>
                      <section>
                        <time>
                          <FiCalendar />
                          { format(
                            new Date(post.first_publication_date),
                            'dd MMM yyyy',
                            {
                              locale: ptBR,
                            }
                          ) }
                        </time>
                        <div>
                          <FiUser />
                          {post.data.author}
                        </div>
                      </section>
                  </article>
                </a>
              </Link>
              )
            )
          }
        </main>


        { nextPage &&
          (
            <button type="button" onClick={handleOpenMorePosts}> Carregar mais posts </button>
          )
        }

      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const response = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author'],
    pageSize: 1,
  });

  const posts = response.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  const postsPagination = {
    next_page: response.next_page,
    results: posts
  }

  return {
    props: {
      postsPagination
    },
    revalidate: 60 * 60,//1 hora
  };

};
