import Document, { Html, Main, Head, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
            <link rel="shortcut icon" href="/favicon.svg" type="image/svg" />

            <title>SpaceTraveling</title>
        </Head>
        <body>
            <Main/>
            <NextScript/>
        </body>
      </Html>
    ) 
  }
}