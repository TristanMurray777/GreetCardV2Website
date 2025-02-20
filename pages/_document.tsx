// pages/_document.js
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
