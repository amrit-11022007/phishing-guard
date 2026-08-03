"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-cyber-bg text-cyber-cyan font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyber-cyan border-t-transparent"></div>
        <p className="text-sm tracking-widest animate-pulse font-semibold">BOOTING CYBER_SHIELD CORE...</p>
      </div>
    </div>
  );
}
