"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Package,
  Grid3X3,
  List,
  Search,
  Filter,
  TrendingUp,
  Star,
  Shield,
  Clock,
  Users,
} from "lucide-react";

// Enhanced Hero Section Component
const CategoriesHero = () => {
  return (
    <section className="relative py-24 bg-gradient-to-br from-[#2C3E50] via-[#34495E] to-[#2C3E50] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-40 h-40 bg-[#F47C20] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-60 h-60 bg-[#F47C20] rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#F47C20] rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Product Categories
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Discover premium fitness supplements organized by category. Find
            exactly what you need for your fitness journey.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#F47C20]" />
              <span>Premium Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#F47C20]" />
              <span>Lab Tested</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#F47C20]" />
              <span>Scratch Card + Fast Delivery</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Enhanced Category Card Component
const CategoryCard = ({ category, index, viewMode }) => {
  // Function to get image URL
  const getImageUrl = (image) => {
    if (!image) return "/placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link href={`/category/${category.slug}`}>
        <div
          className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full transform hover:scale-105 ${
            viewMode === "list" ? "flex" : ""
          }`}
        >
          {/* Image container */}
          <div
            className={`relative overflow-hidden ${
              viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "h-56 w-full"
            }`}
          >
            <Image
              src={
                category.image
                  ? getImageUrl(category.image)
                  : "/placeholder.jpg"
              }
              alt={category.name}
              fill
              className="object-contain transition-transform duration-300 group-hover:scale-110 p-6"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            {/* Product count badge */}
            <div className="absolute top-4 right-4 bg-gradient-to-r from-[#F47C20] to-[#E06A1A] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              {category._count?.products || 0}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
              <div className="text-white text-center">
                <ArrowRight className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Explore Category</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div
            className={`p-6 ${
              viewMode === "list" ? "flex-1 flex flex-col justify-center" : ""
            }`}
          >
            <h3 className="text-xl font-bold mb-3 text-[#2C3E50] group-hover:text-[#F47C20] transition-colors duration-200">
              {category.name}
            </h3>

            <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
              {category.description ||
                "Explore premium supplements in this category designed to support your fitness goals."}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">
                {category._count?.products || 0} products available
              </span>

              <div className="flex items-center text-[#F47C20] font-semibold text-sm group-hover:gap-2 transition-all duration-200">
                <span>View All</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Enhanced Loading Skeleton
const CategoryCardSkeleton = ({ viewMode }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse ${
        viewMode === "list" ? "flex" : ""
      }`}
    >
      <div
        className={`bg-gray-200 ${
          viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "h-56 w-full"
        }`}
      ></div>
      <div
        className={`p-6 ${
          viewMode === "list" ? "flex-1 flex flex-col justify-center" : ""
        }`}
      >
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Stats Section
const StatsSection = ({ categories }) => {
  const totalProducts = categories.reduce(
    (sum, cat) => sum + (cat._count?.products || 0),
    0
  );

  const stats = [
    {
      icon: Package,
      value: categories.length,
      label: "Categories",
      color: "text-[#F47C20]",
    },
    {
      icon: TrendingUp,
      value: totalProducts,
      label: "Products",
      color: "text-[#2C3E50]",
    },
    {
      icon: Star,
      value: "100%",
      label: "Quality",
      color: "text-[#F47C20]",
    },
    {
      icon: Users,
      value: "24/7",
      label: "Support",
      color: "text-[#2C3E50]",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="mt-16 bg-gradient-to-r from-white to-gray-50 rounded-2xl p-8 shadow-xl border border-gray-100"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-[#2C3E50] mb-2">
          Why Choose Us?
        </h2>
        <p className="text-gray-600">
          Premium supplements for every fitness goal
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="text-center group"
          >
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:from-[#F47C20] group-hover:to-[#E06A1A] transition-all duration-300`}
            >
              <stat.icon
                className={`w-8 h-8 ${stat.color} group-hover:text-white transition-colors duration-300`}
              />
            </div>
            <div className={`text-3xl font-bold ${stat.color} mb-2`}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchTerm, setSearchTerm] = useState("");

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

  // Filter categories based on search term
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description &&
        category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <CategoriesHero />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center text-sm">
          <Link
            href="/"
            className="text-gray-500 hover:text-[#F47C20] transition-colors duration-200 flex items-center"
          >
            <span>Home</span>
          </Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-[#F47C20] font-medium">Categories</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="container mx-auto px-4 mb-8">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 p-6 rounded-2xl flex items-start shadow-lg">
            <AlertCircle className="text-red-500 mr-4 mt-1 h-6 w-6 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-800 mb-2 text-lg">
                Error Loading Categories
              </h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">View:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-white text-[#F47C20] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-white text-[#F47C20] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="text-gray-600">
                <span className="font-medium">{filteredCategories.length}</span>{" "}
                of <span className="font-medium">{categories.length}</span>{" "}
                categories
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-[#F47C20] focus:ring-[#F47C20] bg-white text-sm font-medium transition-all duration-200 w-64"
                />
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }`}
          >
            {[...Array(8)].map((_, index) => (
              <CategoryCardSkeleton key={index} viewMode={viewMode} />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {searchTerm ? "No categories found" : "No Categories Available"}
            </h2>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {searchTerm
                ? "Try adjusting your search terms or browse all categories."
                : "We're adding new categories soon. Check back later!"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-all duration-200 mr-4"
              >
                Clear Search
              </button>
            )}
            <Link href="/products">
              <button className="px-8 py-3 bg-gradient-to-r from-[#F47C20] to-[#E06A1A] text-white rounded-xl font-semibold hover:from-[#E06A1A] hover:to-[#D45A0A] transition-all duration-200 transform hover:scale-105 shadow-lg">
                Browse All Products
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Categories Grid/List */}
            <div
              className={`${
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }`}
            >
              {filteredCategories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  viewMode={viewMode}
                />
              ))}
            </div>

            {/* Stats Section */}
            {!loading && categories.length > 0 && (
              <StatsSection categories={categories} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
