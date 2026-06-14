"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authState, setAuthState] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    let ignore = false;
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/verify");
        if (ignore) return;
        if (res.ok) {
          setAuthState("authenticated");
        } else {
          setAuthState("unauthenticated");
          router.replace("/admin/login");
        }
      } catch {
        if (ignore) return;
        setAuthState("unauthenticated");
        router.replace("/admin/login");
      }
    }

    checkAuth();
    return () => { ignore = true; };
  }, [isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (authState === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-pink-500" />
      </main>
    );
  }

  if (authState === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
