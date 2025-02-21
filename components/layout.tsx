
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import Navbar from "./Navbar";

//Specifies Font
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

//Renders Navbar across the whole webpage

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar /> 
      {children}
    </>
  );
}

