import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/signup"); // Redirect to Signup page
  }, []);

  return <p>Redirecting to Signup...</p>;
}
