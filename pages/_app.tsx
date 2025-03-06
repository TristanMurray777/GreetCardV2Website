//References: 1: Pages and layouts: https://nextjs.org/docs/pages/building-your-application/routing/pages-and-layouts?
//ChatGPT-4o: Used to troubleshoot error where globals.css was not being loaded consistently. Prompt: "Can you help me to fix a bug relating to my background not being applied to my webpage?"
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
