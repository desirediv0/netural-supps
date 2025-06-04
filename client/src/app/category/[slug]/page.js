"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Star,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Heart,
  Filter,
  Grid3X3,
  List,
  ShoppingBag,
} from "lucide-react";
import ProductQuickView from "@/components/ProductQuickView";

// Helper function to format image URLs correctly
const getImageUrl = (image) => {
  if (!image) return "/placeholder.svg?height=300&width=400";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

export default function CategoryPage() {
  const params = useParams();
  const { slug } = params;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("newest");
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Fetch category and products
  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setLoading(true);
      try {
        // Parse sort option into API parameters
        let sort = "createdAt";
        let order = "desc";

        switch (sortOption) {
          case "newest":
            sort = "createdAt";
            order = "desc";
            break;
          case "oldest":
            sort = "createdAt";
            order = "asc";
            break;
          case "price-low":
            sort = "price";
            order = "asc";
            break;
          case "price-high":
            sort = "price";
            order = "desc";
            break;
          case "name-asc":
            sort = "name";
            order = "asc";
            break;
          case "name-desc":
            sort = "name";
            order = "desc";
            break;
          default:
            break;
        }

        const response = await fetchApi(
          `/public/categories/${slug}/products?page=${pagination.page}&limit=${pagination.limit}&sort=${sort}&order=${order}`
        );

        setCategory(response.data.category);
        setProducts(response.data.products || []);
        setPagination(response.data.pagination || pagination);
      } catch (err) {
        console.error("Error fetching category:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug, pagination.page, sortOption]); // Removed pagination.limit from dependency array

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle sorting
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Handle quick view
  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  // Loading state
  if (loading && !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 p-6 rounded-2xl border border-red-200 flex items-start max-w-2xl mx-auto">
            <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-red-700 mb-1">
                Error Loading Category
              </h2>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        {/* Category header */}
        {category && (
          <div className="mb-10">
            <div className="flex items-center mb-4 text-sm text-gray-600">
              <Link
                href="/"
                className="hover:text-yellow-600 transition-colors"
              >
                Home
              </Link>
              <span className="mx-2">•</span>
              <Link
                href="/products"
                className="hover:text-yellow-600 transition-colors"
              >
                Products
              </Link>
              <span className="mx-2">•</span>
              <span className="text-yellow-600 font-medium">
                {category.name}
              </span>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold mb-4 text-gray-800">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </div>

                {category.image && (
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 flex-shrink-0">
                    <Image
                      src={getImageUrl(category.image) || "/placeholder.svg"}
                      alt={category.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products header with filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <Filter className="h-5 w-5 mr-2 text-yellow-500" />
                <span className="font-medium">
                  Showing {products.length} of {pagination.total} products
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white text-yellow-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white text-yellow-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center">
                <label
                  htmlFor="sort"
                  className="text-sm mr-3 font-medium text-gray-700"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  name="sort"
                  className="rounded-xl border-2 border-gray-200 focus:border-yellow-500 focus:ring-yellow-500 px-4 py-2 text-sm"
                  onChange={handleSortChange}
                  value={sortOption}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name-asc">Name: A-Z</option>
                  <option value="name-desc">Name: Z-A</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-lg border border-gray-100 text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
              <ShoppingBag className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">
              No products found
            </h2>
            <p className="text-gray-600 mb-8">
              There are no products in this category yet.
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-xl font-semibold">
                Browse All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                : "space-y-6"
            }
          >
            {products.map((product) => (
              <div
                key={product.id}
                className={`bg-white overflow-hidden transition-all hover:shadow-xl shadow-lg border border-gray-100 group ${
                  viewMode === "grid" ? "rounded-2xl" : "rounded-2xl flex"
                }`}
              >
                <Link
                  href={`/products/${product.slug}`}
                  className={viewMode === "list" ? "flex-shrink-0" : "block"}
                >
                  <div
                    className={`relative bg-gradient-to-br from-yellow-50 to-yellow-100 overflow-hidden ${
                      viewMode === "grid" ? "h-64 w-full" : "h-32 w-32"
                    }`}
                  >
                    <Image
                      src={
                        product.images[0]?.url
                          ? getImageUrl(product.images[0].url)
                          : "/placeholder.svg?height=300&width=400"
                      }
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    {product.variants[0]?.salePrice && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        SALE
                      </span>
                    )}

                    {viewMode === "grid" && (
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
                          className="text-white hover:text-white hover:bg-yellow-500/80 rounded-full p-2 mx-2"
                        >
                          <Heart className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </Link>

                <div
                  className={`p-6 ${
                    viewMode === "list" ? "flex-1" : "text-center"
                  }`}
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4"
                          fill={
                            i < Math.round(product._count?.reviews / 2 || 0)
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2">
                      ({product._count?.reviews || 0})
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

                  <div className="flex items-center justify-center mb-3">
                    {product.variants[0]?.salePrice ? (
                      <div className="flex items-center">
                        <span className="font-bold text-xl text-yellow-600">
                          {formatCurrency(product.variants[0]?.salePrice)}
                        </span>
                        <span className="text-gray-500 line-through text-sm ml-2">
                          {formatCurrency(product.variants[0]?.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-xl text-yellow-600">
                        {formatCurrency(
                          product.basePrice || product.variants[0]?.price || 0
                        )}
                      </span>
                    )}
                  </div>

                  {product.flavors > 1 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {product.flavors} variants
                    </span>
                  )}

                  {viewMode === "list" && (
                    <div className="flex items-center space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                        onClick={() => handleQuickView(product)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Quick View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center mt-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                >
                  <ChevronUp className="h-4 w-4 rotate-90" />
                </Button>

                {[...Array(pagination.pages)].map((_, i) => {
                  const page = i + 1;
                  // Show first page, last page, and pages around the current page
                  if (
                    page === 1 ||
                    page === pagination.pages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={
                          pagination.page === page ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 p-0 ${
                          pagination.page === page
                            ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                            : "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  }

                  // Show ellipsis for skipped pages
                  if (
                    (page === 2 && pagination.page > 3) ||
                    (page === pagination.pages - 1 &&
                      pagination.page < pagination.pages - 2)
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                >
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Product Quick View */}
        <ProductQuickView
          product={quickViewProduct}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />
      </div>
    </div>
  );
}
