"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/client-only";
import { fetchApi } from "@/lib/utils";
import Image from "next/image";
import {
  Eye,
  Heart,
  Star,
  ShoppingBag,
  Trash2,
  ArrowRight,
} from "lucide-react";
import ProductQuickView from "@/components/ProductQuickView";
import { toast } from "sonner";

export default function WishlistPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [error, setError] = useState("");
  const [removingItems, setRemovingItems] = useState(new Set());

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login?redirect=/wishlist");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch wishlist items
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!isAuthenticated) return;

      setLoadingItems(true);
      setError("");

      try {
        const response = await fetchApi("/users/wishlist", {
          credentials: "include",
        });

        setWishlistItems(response.data.wishlistItems || []);
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        setError("Failed to load your wishlist. Please try again later.");
      } finally {
        setLoadingItems(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated]);

  // Remove item from wishlist
  const removeFromWishlist = async (wishlistItemId) => {
    setRemovingItems((prev) => new Set(prev).add(wishlistItemId));

    try {
      await fetchApi(`/users/wishlist/${wishlistItemId}`, {
        method: "DELETE",
        credentials: "include",
      });

      // Remove the item from state
      setWishlistItems((current) =>
        current.filter((item) => item.id !== wishlistItemId)
      );
      toast.success("Item removed from wishlist");
    } catch (error) {
      console.error("Failed to remove item from wishlist:", error);
      setError("Failed to remove item. Please try again.");
      toast.error("Failed to remove item from wishlist");
    } finally {
      setRemovingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(wishlistItemId);
        return newSet;
      });
    }
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto py-10 flex justify-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <ClientOnly>
        <div className="container mx-auto py-12 px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full mb-6">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              My Wishlist
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your saved favorites - ready when you are
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-8 max-w-2xl mx-auto">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loadingItems ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 flex justify-center">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : wishlistItems.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
                <Heart className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                Your Wishlist is Empty
              </h2>
              <p className="text-gray-600 mb-8">
                Save your favorite items to your wishlist for easy access later.
              </p>
              <Link href="/products">
                <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Explore Products
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Wishlist Stats */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {wishlistItems.length}{" "}
                      {wishlistItems.length === 1 ? "Item" : "Items"} Saved
                    </h2>
                    <p className="text-gray-600">
                      Your favorite products are waiting for you
                    </p>
                  </div>
                  <Link href="/products">
                    <Button
                      variant="outline"
                      className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Wishlist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {wishlistItems.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white overflow-hidden transition-all hover:shadow-xl shadow-lg rounded-2xl border border-gray-100 group"
                  >
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative h-64 w-full bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden">
                        <Image
                          src={
                            product.images[0] ||
                            "/placeholder.svg?height=300&width=400"
                          }
                          alt={product.name}
                          fill
                          className="object-contain p-4 transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />

                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 backdrop-blur-[2px] flex justify-center py-3 translate-y-full group-hover:translate-y-0 transition-transform">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:text-white hover:bg-yellow-500/80 rounded-full p-2"
                            onClick={(e) => {
                              e.preventDefault();
                              handleQuickView(product);
                            }}
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:text-white hover:bg-red-500/80 rounded-full p-2 mx-2"
                            onClick={(e) => {
                              e.preventDefault();
                              removeFromWishlist(product.id);
                            }}
                            disabled={removingItems.has(product.id)}
                          >
                            {removingItems.has(product.id) ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </Button>
                        </div>

                        {/* Remove button - always visible on mobile */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromWishlist(product.id);
                          }}
                          disabled={removingItems.has(product.id)}
                          className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-500 hover:text-red-600 p-2 rounded-full shadow-md transition-all md:opacity-0 group-hover:opacity-100"
                        >
                          {removingItems.has(product.id) ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </Link>

                    <div className="p-6 text-center">
                      <div className="flex items-center justify-center mb-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4"
                              fill={
                                i < Math.round(product.avgRating || 0)
                                  ? "currentColor"
                                  : "none"
                              }
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          ({product.reviewCount || 0})
                        </span>
                      </div>

                      <Link
                        href={`/products/${product.slug}`}
                        className="hover:text-yellow-600 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-800 mb-3 line-clamp-2 text-lg">
                          {product.name}
                        </h3>
                      </Link>

                      {product.flavors > 1 && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full mb-4 inline-block">
                          {product.flavors} variants
                        </span>
                      )}

                      <div className="flex space-x-2">
                        <Link
                          href={`/products/${product.slug}`}
                          className="flex-1"
                        >
                          <Button className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white rounded-xl font-semibold transition-all duration-200">
                            View Product
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Quick View Dialog */}
          <ProductQuickView
            product={quickViewProduct}
            open={quickViewOpen}
            onOpenChange={setQuickViewOpen}
          />
        </div>
      </ClientOnly>
    </div>
  );
}
