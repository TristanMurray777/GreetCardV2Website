//References: 1: https://docs.expo.dev/versions/latest/sdk/router/
//This page is used to redirect the user to the home page
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/home"); 
  }, []);

  return <p>Redirecting to Home...</p>;
}
