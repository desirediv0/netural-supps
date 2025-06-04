"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertCircle, ShoppingBag } from "lucide-react";

// Category card component
const CategoryCard = ({ category, index }) => {
  // Function to get image URL
  const getImageUrl = (image) => {
    if (!image) return "/placeholder.svg?height=300&width=400";
    if (image.startsWith("http")) return image;
    return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="flex flex-col items-center group"
    >
      <div className="relative">
        <motion.div
          className="relative w-full h-[420px] rounded-[30px] overflow-hidden bg-gradient-to-br from-white to-gray-50 shadow-2xl"
          whileHover={{ y: -10 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {/* Main Image Container with Overlay */}
          <div className="relative h-[250px] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
            <Image
              src={getImageUrl(category.image)}
              alt={category.name}
              width={800}
              height={800}
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
                <span className="text-sm font-semibold bg-gradient-to-r from-yellow-500 to-[#ce801f] bg-clip-text text-transparent">
                  {category._count?.products || 0} Products
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
                className="w-full bg-gradient-to-r from-yellow-500 via-yellow-400 to-[#ce801f] text-white py-3 rounded-2xl flex items-center justify-center group relative overflow-hidden shadow-xl"
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
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Category skeleton loader for loading state
const CategoryCardSkeleton = () => {
  return (
    <div className="flex flex-col items-center animate-pulse">
      <div className="w-full h-[420px] rounded-[30px] bg-gray-200 relative overflow-hidden">
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetchApi("/public/categories");
        setCategories(response.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="min-h-screen py-24 bg-gradient-to-b from-yellow-50 via-white to-pink-50 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-[#ce801f] rounded-full mb-8">
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              All Categories
            </h1>
            <div className="flex items-center justify-center text-sm text-gray-600 mb-6">
              <Link href="/" className="hover:text-yellow-600 transition-colors">
                Home
              </Link>
              <span className="mx-2">•</span>
              <span className="text-yellow-600 font-medium">Categories</span>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our complete range of premium fitness supplements and
              equipment
            </p>
          </motion.div>

          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-yellow-300/20 to-pink-300/20 rounded-full blur-3xl -z-10" />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50/50 backdrop-blur-sm border border-red-200 p-8 rounded-[30px] mb-12 flex items-start max-w-2xl mx-auto shadow-lg"
          >
            <AlertCircle className="text-red-500 mr-4 mt-0.5 flex-shrink-0 h-6 w-6" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">
                Error Loading Categories
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        )}

        <div className="relative">
          {/* Background Decorations */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-yellow-300/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-pink-300/10 rounded-full blur-3xl" />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <CategoryCardSkeleton key={index} />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-[30px] shadow-xl border border-white/20 max-w-md mx-auto"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-500 to-pink-500 rounded-full mb-8">
                <ShoppingBag className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                No Categories Found
              </h2>
              <p className="text-gray-600 mb-8">
                Please check back later for our exciting categories.
              </p>
              <Link href="/products">
                <motion.button
                  className="bg-gradient-to-r from-yellow-500 via-yellow-400 to-pink-500 text-white px-8 py-3 rounded-full font-medium hover:shadow-lg transition-shadow relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="absolute inset-0 bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <span className="relative">Browse All Products</span>
                </motion.button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <CategoryCard category={category} index={index} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
