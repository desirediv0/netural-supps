"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

// Define private routes that require authentication
const privateRoutes = [
  "/account",
  "/checkout",
  "/wishlist",
  "/shipping",
  "/cart",
  "/orders",
];

// Define auth routes that should redirect to dashboard if already logged in
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export function RouteGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [firstRun, setFirstRun] = useState(true);

  useEffect(() => {
    // Authentication check
    const authCheck = () => {
      // Skip verification for verification endpoints and public pages
      if (
        pathname.startsWith("/verify-email") ||
        pathname === "/" ||
        pathname.startsWith("/products") ||
        pathname.startsWith("/category") ||
        pathname.startsWith("/blog") ||
        pathname.startsWith("/about") ||
        pathname.startsWith("/contact") ||
        pathname.startsWith("/faqs")
      ) {
        setAuthorized(true);
        return;
      }

      // Check if route requires auth
      const isPrivateRoute = privateRoutes.some((route) =>
        pathname.startsWith(route)
      );

      // Check if route is an auth route (login, register, etc.)
      const isAuthRoute = authRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isPrivateRoute && !isAuthenticated) {
        // Save current path for redirect after login (except for cart which redirects to home)
        const redirectPath = pathname === "/cart" ? "/" : pathname;

        // Show toast only if it's not the first run (to prevent showing on initial page load)
        if (!firstRun) {
          toast.error("Please log in to access this page");
        }

        router.push(`/login?returnUrl=${encodeURIComponent(redirectPath)}`);
      } else if (isAuthRoute && isAuthenticated) {
        // Check if user just logged in (to prevent double toast message)
        const justLoggedIn =
          typeof window !== "undefined"
            ? sessionStorage.getItem("justLoggedIn")
            : null;

        // Only show notification if not first run and not just logged in
        if (!firstRun && !justLoggedIn) {
          toast.info("You are already logged in");
        }

        // Clear the justLoggedIn flag if it exists
        if (justLoggedIn) {
          sessionStorage.removeItem("justLoggedIn");
        }

        router.push("/");
      } else {
        setAuthorized(true);
      }

      // After first run, clear flag
      if (firstRun) {
        setFirstRun(false);
      }
    };

    // Only run authCheck if we're not still loading auth state
    if (!loading) {
      authCheck();
    } else {
      // While loading, consider the user authorized to avoid flashing screens
      setAuthorized(true);
    }
  }, [isAuthenticated, loading, pathname, router, firstRun]);

  // Always render children - no more loading or unauthorized screens
  return children;
}
