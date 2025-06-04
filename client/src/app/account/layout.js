"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ClientOnly } from "@/components/client-only";
import { User, Package, MapPin, Heart } from "lucide-react";

export default function AccountLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto py-10 flex justify-center">
          <div className="w-12 h-12 border-4 border-yellow-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // List of navigation items with their paths and icons
  const navItems = [
    { path: "/account", label: "Profile", icon: User },
    { path: "/account/orders", label: "Orders", icon: Package },
    { path: "/account/addresses", label: "Addresses", icon: MapPin },
    { path: "/wishlist", label: "Wishlist", icon: Heart },
  ];

  // Check if the current path matches a nav item
  const isActive = (path) => pathname === path;

  // Special pages like order details or change password that should not show the sidebar
  const specialPages = ["/account/orders/", "/account/change-password"];

  // Check if current path is a special page where we don't show the sidebar
  const isSpecialPage = specialPages.some(
    (path) => pathname.startsWith(path) && pathname !== "/account/orders"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <ClientOnly>
        <div className="container mx-auto py-10 px-4">
          {isSpecialPage ? (
            // For pages like order details, just render the children
            children
          ) : (
            // For regular account pages, render with the sidebar
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
                      <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                        <User className="h-5 w-5 text-yellow-600" />
                      </div>
                      My Account
                    </h2>
                    <nav className="space-y-2">
                      {navItems.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center p-3 rounded-xl transition-all duration-200 ${
                              isActive(item.path)
                                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg"
                                : "hover:bg-yellow-50 text-gray-700 hover:text-yellow-600"
                            }`}
                          >
                            <IconComponent className="mr-3 h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="md:col-span-3">{children}</div>
            </div>
          )}
        </div>
      </ClientOnly>
    </div>
  );
}
