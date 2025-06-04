"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function AuthRedirect({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check if user just logged in
    const justLoggedIn = sessionStorage.getItem("justLoggedIn");

    // If user just logged in, don't redirect
    if (justLoggedIn === "true") {
      sessionStorage.removeItem("justLoggedIn");
      return;
    }

    // Only redirect if authenticated and not loading
    if (!loading && isAuthenticated) {
      router.replace("/account");
    }
  }, [isAuthenticated, loading, router]);

  // Always render children - don't show loading or redirecting screens
  return children;
}
