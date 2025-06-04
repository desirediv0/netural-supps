"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star, Eye, Heart, ShoppingCart } from "lucide-react";
import ProductQuickView from "./ProductQuickView";

const ProductSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
    <div className="relative h-64 bg-gray-200"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

const FeaturedProducts = ({
  products = [],
  isLoading = false,
  error = null,
}) => {
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  if (!isLoading && !error && products.length === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-500">Failed to load products</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#2C3E50] to-[#ce801f] bg-clip-text text-transparent mb-4">
            Featured Products
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-1 bg-gradient-to-r from-[#2C3E50] to-[#ce801f] rounded-full"></div>
            <div className="w-3 h-3 bg-[#ce801f] rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-[#ce801f] to-[#2C3E50] rounded-full"></div>
          </div>
        </div>

        {/* Products Carousel */}
        <div className="relative px-8">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {products.map((product) => (
                <CarouselItem
                  key={product.id || product.slug || Math.random().toString()}
                  className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group relative transform hover:-translate-y-2 h-full flex flex-col">
                    {/* Product Image */}
                    <div className="relative h-72 bg-gradient-to-br from-gray-50 to-white overflow-hidden flex-shrink-0">
                      <Link href={`/products/${product.slug || ""}`}>
                        {product.image ? (
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name || "Product"}
                            fill
                            className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        ) : (
                          <Image
                            src="/product-placeholder.jpg"
                            alt={product.name || "Product"}
                            fill
                            className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          />
                        )}
                      </Link>

                      {/* Sale Badge */}
                      {product.hasSale && (
                        <span className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-[#F47C20] text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg transform -rotate-12">
                          SALE
                        </span>
                      )}

                      {/* Action Icons */}
                      <div className="absolute top-4 right-4 flex flex-col space-y-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 p-0 bg-white hover:bg-gradient-to-r hover:from-[#F47C20] hover:to-[#E06A1A] hover:text-white rounded-full shadow-lg backdrop-blur-sm bg-opacity-90 transform hover:scale-110 transition-all duration-300"
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 p-0 bg-white hover:bg-gradient-to-r hover:from-[#F47C20] hover:to-[#E06A1A] hover:text-white rounded-full shadow-lg backdrop-blur-sm bg-opacity-90 transform hover:scale-110 transition-all duration-300"
                          onClick={(e) => {
                            e.preventDefault();
                            setQuickViewProduct(product);
                            setQuickViewOpen(true);
                          }}
                        >
                          <Eye className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6 flex-grow flex flex-col">
                      {/* Product Name */}
                      <Link
                        href={`/products/${product.slug || ""}`}
                        className="block transition-colors flex-grow"
                      >
                        <h3 className="font-semibold text-gray-800 mb-2 text-lg line-clamp-2 group-hover:text-[#F47C20] transition-colors">
                          {product.name || "Product"}
                        </h3>
                      </Link>

                      {/* Rating */}
                      <div className="flex items-center mb-3">
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
                        <span className="text-sm text-gray-500 ml-2">
                          ({product.reviewCount || 0})
                        </span>
                      </div>

                      {/* Price */}
                      <div className="mb-4">
                        {product.hasSale ? (
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-2xl bg-gradient-to-r from-[#50432c] to-[#ce801f] bg-clip-text text-transparent">
                              ₹{product.basePrice || 0}
                            </span>
                            <span className="text-gray-400 line-through text-base">
                              ₹{product.regularPrice || 0}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-2xl bg-gradient-to-r from-[#50432c] to-[#ce801f] bg-clip-text text-transparent">
                            ₹{product.basePrice || 0}
                          </span>
                        )}
                      </div>

                      {/* Variants Info */}
                      {(product.flavors || 0) > 1 && (
                        <p className="text-sm text-gray-500 mb-4">
                          {product.flavors} variants available
                        </p>
                      )}

                      {/* Add to Cart Button */}
                      <Button
                        className="w-full bg-gradient-to-r from-[#ce801f] to-[#ce801f] hover:from-[#ce801f] hover:to-[#ce801f] text-white font-medium py-3 rounded-xl transition-all duration-500 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 group mt-auto"
                        onClick={(e) => {
                          e.preventDefault();
                          console.log("Add to cart:", product);
                        }}
                      >
                        <ShoppingCart className="h-5 w-5 mr-2 transition-transform duration-500 group-hover:rotate-12" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 w-12 h-12 bg-white border-2 border-[#ce801f] text-[#ce801f] hover:bg-gradient-to-r hover:from-[#ce801f] hover:to-[#ce801f] hover:text-white transition-all duration-300 transform hover:scale-110" />
            <CarouselNext className="hidden md:flex -right-4 w-12 h-12 bg-white border-2 border-[#ce801f] text-[#ce801f] hover:bg-gradient-to-r hover:from-[#ce801f] hover:to-[#ce801f] hover:text-white transition-all duration-300 transform hover:scale-110" />
          </Carousel>
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-16">
          <Link href="/products">
            <Button
              variant="outline"
              size="lg"
              className="font-medium border-2 border-[#ce801f] text-[#ce801f] hover:bg-gradient-to-r hover:from-[#ce801f] hover:to-[#ce801f] hover:text-white px-12 py-6 rounded-full transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl group"
            >
              <span className="mr-2 transition-transform duration-500 group-hover:translate-x-1">
                View All Products
              </span>
              <span className="relative top-[1px] transition-transform duration-500 group-hover:translate-x-2">
                →
              </span>
            </Button>
          </Link>
        </div>

        {/* Quick View Dialog */}
        <ProductQuickView
          product={quickViewProduct}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />
      </div>
    </section>
  );
};

export default FeaturedProducts;
