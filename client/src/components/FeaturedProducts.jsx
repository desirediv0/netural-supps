"use client";

import Link from "next/link";
import ProductCard from "./ProducCard";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#2C3E50] to-orange-500 bg-clip-text text-transparent mb-4">
            Featured Products
          </h2>
          <div className="flex items-center justify-center gap-2">
            <div className="w-12 h-1 bg-gradient-to-r from-[#2C3E50] to-orange-500 rounded-full"></div>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-[#2C3E50] rounded-full"></div>
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
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 w-12 h-12 bg-white border-2 border-orange-500 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110" />
            <CarouselNext className="hidden md:flex -right-4 w-12 h-12 bg-white border-2 border-orange-500 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-500 hover:text-white transition-all duration-300 transform hover:scale-110" />
          </Carousel>
        </div>

        {/* View All Products Button */}
        <div className="text-center mt-16">
          <Link href="/products">
            <Button
              variant="outline"
              size="lg"
              className="font-medium border-2 border-orange-500 text-orange-500 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-500 hover:text-white px-12 py-6 rounded-full transition-all duration-500 transform hover:-translate-y-1 hover:shadow-2xl group"
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
      </div>
    </section>
  );
};

export default FeaturedProducts;
