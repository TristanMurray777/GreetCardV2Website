//This page is used to modfy the server-side rendered HTML document
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head />
      <body className="bg-custom">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
