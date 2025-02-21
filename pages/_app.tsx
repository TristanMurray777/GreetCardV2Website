import type { AppProps } from "next/app";
import RootLayout from "../components/layout"; 
import "../styles/globals.css";

//This page was created to combat an issue I had with globals.css not being loaded consistently
//Wraps entire webpage in root layout
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RootLayout>
      <Component {...pageProps} />
    </RootLayout>
  );
}
