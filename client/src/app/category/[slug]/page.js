"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchApi } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProducCard";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  List,
  Filter,
  ArrowLeft,
} from "lucide-react";

// Helper function to format image URLs correctly
const getImageUrl = (image) => {
  if (!image) return "/placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState("newest");
  const [viewMode, setViewMode] = useState("grid"); // grid or list

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
  }, [slug, pagination.page, pagination.limit, sortOption]);

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

  // No-op: Quick view handled inside ProductCard

  // Loading state
  if (loading && !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#F47C20] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl border border-red-200 shadow-lg">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mr-4 mt-1 h-6 w-6 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-bold text-red-700 mb-2">
                  Error Loading Category
                </h2>
                <p className="text-red-600">{error}</p>
                <Button
                  onClick={() => router.back()}
                  className="mt-4 bg-red-600 hover:bg-red-700"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Category header */}
        {category && (
          <div className="mb-12">
            {/* Breadcrumb */}
            <div className="flex items-center mb-6 text-sm">
              <Link
                href="/"
                className="text-gray-500 hover:text-[#F47C20] transition-colors duration-200 flex items-center"
              >
                <span>Home</span>
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link
                href="/products"
                className="text-gray-500 hover:text-[#F47C20] transition-colors duration-200"
              >
                Products
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-[#F47C20] font-medium">
                {category.name}
              </span>
            </div>

            {/* Category Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-[#2C3E50] mb-4">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <span>• {pagination.total} products available</span>
                    <span>• Premium quality supplements</span>
                  </div>
                </div>

                {category.image && (
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg flex-shrink-0">
                    <Image
                      src={getImageUrl(category.image)}
                      alt={category.name}
                      width={128}
                      height={128}
                      className="object-contain w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products header with controls */}
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
                <span className="font-medium">{products.length}</span> of{" "}
                <span className="font-medium">{pagination.total}</span> products
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <label
                  htmlFor="sort"
                  className="text-sm font-medium text-gray-700"
                >
                  Sort by:
                </label>
              </div>
              <select
                id="sort"
                name="sort"
                className="rounded-xl border-gray-200 shadow-sm focus:border-[#F47C20] focus:ring-[#F47C20] bg-white px-4 py-2 text-sm font-medium transition-all duration-200"
                onChange={handleSortChange}
                value={sortOption}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {products.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-gray-100">
            <div className="text-gray-400 mb-6">
              <AlertCircle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No products found
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              There are no products in this category yet. Check back soon!
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-[#F47C20] to-[#E06A1A] hover:from-[#E06A1A] hover:to-[#D45A0A] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                Browse All Products
              </Button>
            </Link>
          </div>
        ) : (
          <div
            className={`${
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }`}
          >
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center items-center mt-12">
            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  <ChevronUp className="h-4 w-4 rotate-90" />
                  Previous
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
                        className={`w-10 h-10 p-0 rounded-xl transition-all duration-200 ${
                          pagination.page === page
                            ? "bg-[#F47C20] hover:bg-[#E06A1A]"
                            : "hover:bg-gray-50"
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
                  className="rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Next
                  <ChevronDown className="h-4 w-4 rotate-90" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick View handled inside ProductCard */}
      </div>
    </div>
  );
}
