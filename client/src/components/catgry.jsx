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

const CircularCategoryCard = ({ category, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex flex-col items-center group"
    >
      <div className="relative">
        <motion.div
          className="relative w-[320px] h-[420px] rounded-[30px] overflow-hidden bg-gradient-to-br from-white to-gray-50 "
          whileHover={{ y: -10 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Main Image Container with Overlay */}
          <div className="relative h-[250px] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <Image
              width={800}
              height={800}
              src={category.image || "/placeholder.svg?height=400&width=400"}
              alt={category.name}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />

            {/* Floating Elements */}
            <motion.div
              className="absolute top-4 right-4 z-20"
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="bg-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold bg-gradient-to-r from-yellow-500 to-yellow-100 bg-clip-text text-transparent">
                  {category._count?.products || category.count || 0} Products
                </span>
              </div>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="p-6 relative">
            {/* Category Name with Gradient */}
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              {category.name}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-6 line-clamp-2">
              {category.description || "Explore our collection"}
            </p>

            {/* Interactive Footer */}
            <div className="absolute bottom-6 left-6 right-6">
              <motion.button
                className="w-full bg-gradient-to-r from-[#ce801f] via-[#b98544] to-[#ce801f] text-white py-3 rounded-2xl flex items-center justify-center group relative overflow-hidden shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="absolute inset-0 bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center space-x-2">
                  <span className="font-medium">Explore Category</span>
                  <svg
                    className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
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
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-yellow-500/20 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </motion.div>
  );
};

const SkeletonLoader = () => {
  return (
    <div className="flex flex-col items-center animate-pulse">
      <div className="w-[320px] h-[420px] rounded-[30px] bg-gray-200 relative overflow-hidden">
        <div className="h-[250px] bg-gray-300" />
        <div className="p-6">
          <div className="h-8 bg-gray-300 rounded-lg w-3/4 mb-3" />
          <div className="h-4 bg-gray-300 rounded w-full mb-2" />
          <div className="h-4 bg-gray-300 rounded w-2/3 mb-6" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="h-12 bg-gray-300 rounded-2xl w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

const FeaturedCategoriesCarousel = ({ categories }) => {
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
    <div className="relative px-4 p-8 ">
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        className="w-full max-w-7xl mx-auto"
      >
        <CarouselContent className="-ml-4">
          {categories.map((category, index) => (
            <CarouselItem
              key={category.id || index}
              className="pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Link href={`/category/${category.slug || ""}`} className="block">
                <CircularCategoryCard category={category} index={index} />
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="hidden md:flex absolute -left-12 -translate-x-0 bg-white/80 backdrop-blur-sm border-none shadow-lg hover:bg-yellow-500 hover:text-white" />
        <CarouselNext className="hidden md:flex absolute -right-12 -translate-x-0 bg-white/80 backdrop-blur-sm border-none shadow-lg hover:bg-yellow-500 hover:text-white" />

        {/* Dot indicators */}
        <div className="flex justify-center mt-8 gap-2">
          {Array.from({ length: Math.ceil(categories.length / 3) }).map(
            (_, idx) => (
              <button
                key={idx}
                onClick={() => api?.scrollTo(idx * 3)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / 3) === idx
                    ? "bg-yellow-500 scale-110"
                    : "bg-gray-300"
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

const FeaturedCategoriesSection = () => {
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
    <section className="py-24  overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#2C3E50] to-[#ce801f] bg-clip-text text-transparent mb-4">
                Featured Categories
              </h2>
              <p className="text-gray-600 mt-6 mb-10 max-w-2xl mx-auto text-lg font-medium">
                Discover our exceptional collection of premium fitness
                supplements
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-12 h-1 bg-gradient-to-r from-[#2C3E50] to-[#ce801f] rounded-full"></div>
                <div className="w-3 h-3 bg-[#ce801f] rounded-full"></div>
                <div className="w-12 h-1 bg-gradient-to-r from-[#ce801f] to-[#2C3E50] rounded-full"></div>
              </div>
            </div>
          </motion.div>

          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-yellow-300/20 to-yellow-300/20 rounded-full blur-3xl -z-10" />
        </div>

        {categoriesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {[...Array(3)].map((_, index) => (
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
            {/* Background Decorations */}
            <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl" />

            <FeaturedCategoriesCarousel categories={categories} />
          </div>
        )}

        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Link href="/categories">
            <motion.button
              className="group relative inline-flex items-center justify-center px-8 py-4  font-bold text-white rounded-full overflow-hidden bg-gradient-to-r from-[#ce801f] via-[#ce801f] to-[#ce801f] shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#ce801f] to-[#ce801f] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative flex items-center space-x-2">
                <span>VIEW ALL CATEGORIES</span>
                <svg
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300"
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

export default FeaturedCategoriesSection;
