import Link from 'next/link';
import { GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { getPrismicClient } from '../services/prismic';


import styles from './home.module.scss';
import { FiCalendar, FiUser } from "react-icons/fi";
import commonStyles from '../styles/common.module.scss';
import { useEffect, useState } from 'react';
import { Head } from 'next/document';

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

  console.log(postsPagination);

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, [postsPagination.results, postsPagination.next_page]);

  // tratar se tem ou não posts

  // carregando mais posts
  function handleOpenMorePosts () {
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }),
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
      
      <div className={`${styles.main} ${commonStyles.mainPosition}`}>
        <main>
          {
            posts.map(post => (
              <Link key={post.uid} href={`/posts/${post.uid}`}>
                <a>
                  <article>
                      <strong>{post.data.title}</strong>
                      <p>{post.data.subtitle}</p>
                      <section>
                        <time>
                          <FiCalendar />
                          {post.first_publication_date}
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
        {
          nextPage &&
          (
            <button type="button" onClick={handleOpenMorePosts} >Carregar mais posts</button>
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
      first_publication_date: post.last_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: {
          posts: posts
        }
      }
    },
  };

};
