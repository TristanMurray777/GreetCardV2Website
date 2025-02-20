import type { AppProps } from "next/app";
import RootLayout from "../components/layout"; // This includes your Navbar
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
}
