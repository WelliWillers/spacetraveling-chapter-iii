import { GetStaticProps } from 'next';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

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

export default function Home() {
  return (
    <>
      <div className={`${styles.main} ${commonStyles.mainPosition}`}>
        <main>
          <Link href="#0">
            <article>
              <a >
                <strong>Como utilizar Hooks</strong>
                <p>Pensando em sincronização em vez de ciclos de vida.</p>
                <section>
                  <time>
                    15 Mar 2021  
                  </time>
                  <div>
                    Wellington Willers
                  </div>
                </section>
              </a>
            </article>
          </Link>
          <Link href="#0">
            <article>
              <a >
                <strong>Como utilizar Hooks</strong>
                <p>Pensando em sincronização em vez de ciclos de vida.</p>
                <section>
                  <time>
                    15 Mar 2021  
                  </time>
                  <div>
                    Wellington Willers
                  </div>
                </section>
              </a>
            </article>
          </Link>
        </main>

        <button>Carregar mais posts</button>
      </div>

    </>
  );
}

// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);

//   // TODO
// };
