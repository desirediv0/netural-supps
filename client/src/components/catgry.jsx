"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import Headtext from "./ui/headtext";
import Image from "next/image";

const CompactCategoryCard = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link href={`/category/${category.slug || ""}`} className="block">
        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
            <Image
              width={400}
              height={300}
              src={category.image || "/placeholder.jpg"}
              alt={category.name}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />

            {/* Product Count Badge */}
            <div className="absolute top-3 right-3 z-20">
              <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                <span className="text-xs font-semibold text-gray-700">
                  {category._count?.products || 0} Products
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#ce801f] transition-colors duration-300">
              {category.name}
            </h3>

            <p className="text-gray-500 text-sm mb-3 line-clamp-2">
              {category.description || "Explore our premium collection"}
            </p>

            {/* Explore Button */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Explore Now</span>
              <motion.div
                className="w-8 h-8 bg-gradient-to-r from-[#ce801f] to-[#b98544] rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#ce801f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>
    </motion.div>
  );
};

const SkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        <div className="h-48 bg-gray-200" />
        <div className="p-4">
          <div className="h-5 bg-gray-200 rounded mb-2" />
          <div className="h-3 bg-gray-200 rounded mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

const CompactCategoriesCarousel = ({ categories }) => {
  const [api, setApi] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  if (!categories || categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No categories available at the moment</p>
      </div>
    );
  }

  return (
    <div className="relative px-4">
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
          align: "start",
          slidesToScroll: 1,
        }}
        className="w-full max-w-6xl mx-auto"
      >
        <CarouselContent className="-ml-4">
          {categories.map((category, index) => (
            <CarouselItem
              key={category.id || index}
              className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <CompactCategoryCard category={category} index={index} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Custom Navigation Buttons */}
        <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border-none shadow-lg hover:bg-[#ce801f] hover:text-white transition-all duration-300 w-10 h-10 rounded-full" />
        <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border-none shadow-lg hover:bg-[#ce801f] hover:text-white transition-all duration-300 w-10 h-10 rounded-full" />

        {/* Progress Indicators */}
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: Math.ceil(categories.length / 4) }).map(
            (_, idx) => (
              <button
                key={idx}
                onClick={() => api?.scrollTo(idx * 4)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / 4) === idx
                    ? "bg-[#ce801f] scale-125"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide group ${idx + 1}`}
              />
            )
          )}
        </div>
      </Carousel>
    </div>
  );
};

const CompactCategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRes = await fetchApi("/public/categories");
        setCategories(categoriesRes?.data?.categories || []);
        setCategoriesLoading(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err?.message || "Failed to fetch categories");
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-16 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <div className="text-center">
              <Headtext text="CATEGORIES" />
              <p className="text-gray-600 max-w-xl mx-auto text-base mt-5">
                Discover our curated collection of premium fitness supplements
              </p>

              {/* Decorative Line */}
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#ce801f]"></div>
                <div className="w-2 h-2 bg-[#ce801f] rounded-full"></div>
                <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#ce801f]"></div>
              </div>
            </div>
          </motion.div>

          {/* Background Decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-[#ce801f]/10 to-transparent rounded-full blur-3xl -z-10" />
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            {[...Array(4)].map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 font-medium">
              Failed to load categories
            </p>
          </div>
        ) : (
          <div className="relative">
            <CompactCategoriesCarousel categories={categories} />
          </div>
        )}

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Link href="/categories">
            <motion.button
              className="group relative inline-flex items-center justify-center px-6 py-3 font-semibold text-white rounded-full overflow-hidden bg-gradient-to-r from-[#ce801f] to-[#b98544] shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center space-x-2">
                <span>View All Categories</span>
                <svg
                  className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CompactCategoriesSection;
