"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertCircle,
  Search,
  Heart,
  Eye,
  ShoppingCart,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import ProductQuickView from "@/components/ProductQuickView";
import { toast } from "sonner";

// Product Card Skeleton
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
      <div className="h-64 w-full bg-gray-200"></div>
      <div className="p-6">
        <div className="flex justify-center mb-3">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded mb-3"></div>
        <div className="h-4 w-3/4 mx-auto bg-gray-200 rounded mb-4"></div>
        <div className="flex justify-center">
          <div className="h-6 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-10 w-full bg-gray-200 rounded mt-4"></div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categorySlug = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(1000);

  const [filters, setFilters] = useState({
    search: searchQuery,
    category: categorySlug,
    flavor: "",
    weight: "",
    minPrice: "",
    maxPrice: "",
    sort: "createdAt",
    order: "desc",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const { addToCart } = useCart();
  const [debugMode, setDebugMode] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState([]);
  const [selectedWeights, setSelectedWeights] = useState([]);

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();

        queryParams.append("page", pagination.page);
        queryParams.append("limit", pagination.limit);

        const validSortFields = ["createdAt", "updatedAt", "name", "featured"];
        let sortField = filters.sort;

        if (!validSortFields.includes(sortField)) {
          sortField = "createdAt";
          console.warn(
            `Invalid sort field: ${filters.sort}, using createdAt instead`
          );
        }

        queryParams.append("sort", sortField);
        queryParams.append("order", filters.order);

        if (filters.search) queryParams.append("search", filters.search);
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
        if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);

        if (selectedFlavors.length > 0) {
          queryParams.append("flavor", selectedFlavors[0]);
        }

        if (selectedWeights.length > 0) {
          queryParams.append("weight", selectedWeights[0]);
        }

        const response = await fetchApi(
          `/public/products?${queryParams.toString()}`
        );

        let filteredProducts = response.data.products || [];

        if (
          selectedFlavors.length > 0 &&
          selectedWeights.length > 0 &&
          filteredProducts.length > 0
        ) {
          const productsWithExactMatch = [];

          for (const product of filteredProducts) {
            try {
              const detailResponse = await fetchApi(
                `/public/products/${product.slug}`
              );
              const detailedProduct = detailResponse.data.product;

              const hasMatchingVariant = detailedProduct.variants.some(
                (variant) =>
                  variant.flavor?.id === selectedFlavors[0] &&
                  variant.weight?.id === selectedWeights[0]
              );

              if (hasMatchingVariant) {
                productsWithExactMatch.push(product);
              }
            } catch (err) {
              console.error(
                `Error fetching details for product ${product.slug}:`,
                err
              );
            }
          }

          filteredProducts = productsWithExactMatch;
          setPagination({
            ...response.data.pagination,
            total: productsWithExactMatch.length,
          });
        } else {
          setPagination(response.data.pagination || {});
        }

        setProducts(filteredProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    filters,
    pagination.page,
    pagination.limit,
    selectedFlavors,
    selectedWeights,
  ]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [categoriesRes, flavorsRes, weightsRes] = await Promise.all([
          fetchApi("/public/categories"),
          fetchApi("/public/flavors"),
          fetchApi("/public/weights"),
        ]);

        setCategories(categoriesRes.data.categories || []);
        setFlavors(flavorsRes.data.flavors || []);
        setWeights(weightsRes.data.weights || []);
      } catch (err) {
        console.error("Error fetching filter options:", err);
      }
    };

    fetchFilterOptions();
  }, []);

  useEffect(() => {
    setPriceRange([
      filters.minPrice ? Number.parseInt(filters.minPrice) : 0,
      filters.maxPrice ? Number.parseInt(filters.maxPrice) : maxPossiblePrice,
    ]);
  }, [filters.minPrice, filters.maxPrice, maxPossiblePrice]);

  useEffect(() => {
    const fetchMaxPrice = async () => {
      try {
        const response = await fetchApi("/public/products/max-price");
        const maxPrice = response.data.maxPrice || 1000;
        setMaxPossiblePrice(Math.ceil(maxPrice / 100) * 100);
      } catch (err) {
        console.error("Error fetching max price:", err);
        setMaxPossiblePrice(1000);
      }
    };

    fetchMaxPrice();
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(`Error loading products. Please try again.`);
    }
  }, [error]);

  const handleFilterChange = (name, value) => {
    if ((name === "minPrice" || name === "maxPrice") && value !== "") {
      const numValue = Number.parseFloat(value);
      if (isNaN(numValue)) {
        return;
      }
      value = numValue.toString();
    }

    setFilters((prev) => ({ ...prev, [name]: value }));

    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }

    if (
      mobileFiltersOpen &&
      window.innerWidth < 768 &&
      name !== "minPrice" &&
      name !== "maxPrice" &&
      name !== "search"
    ) {
      setMobileFiltersOpen(false);
    }
  };

  const handleFlavorChange = (flavorId) => {
    const isAlreadySelected = selectedFlavors.includes(flavorId);

    if (isAlreadySelected) {
      const updatedFlavors = selectedFlavors.filter((id) => id !== flavorId);
      setSelectedFlavors(updatedFlavors);
      handleFilterChange(
        "flavor",
        updatedFlavors.length > 0 ? updatedFlavors[0] : ""
      );
    } else {
      setSelectedFlavors([flavorId]);
      handleFilterChange("flavor", flavorId);
    }
  };

  const handleWeightChange = (weightId) => {
    const isAlreadySelected = selectedWeights.includes(weightId);

    if (isAlreadySelected) {
      const updatedWeights = selectedWeights.filter((id) => id !== weightId);
      setSelectedWeights(updatedWeights);
      handleFilterChange(
        "weight",
        updatedWeights.length > 0 ? updatedWeights[0] : ""
      );
    } else {
      setSelectedWeights([weightId]);
      handleFilterChange("weight", weightId);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      flavor: "",
      weight: "",
      minPrice: "",
      maxPrice: "",
      sort: "createdAt",
      order: "desc",
    });

    setSelectedFlavors([]);
    setSelectedWeights([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (e) => {
    const value = e.target.value;

    switch (value) {
      case "newest":
        handleFilterChange("sort", "createdAt");
        handleFilterChange("order", "desc");
        break;
      case "oldest":
        handleFilterChange("sort", "createdAt");
        handleFilterChange("order", "asc");
        break;
      case "price-low":
        handleFilterChange("sort", "createdAt");
        handleFilterChange("order", "asc");
        break;
      case "price-high":
        handleFilterChange("sort", "createdAt");
        handleFilterChange("order", "desc");
        break;
      case "name-asc":
        handleFilterChange("sort", "name");
        handleFilterChange("order", "asc");
        break;
      case "name-desc":
        handleFilterChange("sort", "name");
        handleFilterChange("order", "desc");
        break;
      default:
        break;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = async (product) => {
    try {
      if (!product || !product.variants || product.variants.length === 0) {
        const response = await fetchApi(
          `/public/products/${product.id}/variants`
        );
        const variants = response.data.variants || [];

        if (variants.length === 0) {
          toast.error("This product is currently not available");
          return;
        }

        const variantId = variants[0].id;
        await addToCart(variantId, 1);
        toast.success(`${product.name} added to cart`);
      } else {
        const variantId = product.variants[0].id;
        await addToCart(variantId, 1);
        toast.success(`${product.name} added to cart`);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add product to cart");
    }
  };

  const handleQuickView = (product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
  };

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-[#ce801f] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="relative w-full h-[300px] mb-12 rounded-xl overflow-hidden shadow-lg">
          <Image
            src="/banner-background.jpg"
            alt="Premium Supplements"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2C3E50]/90 to-transparent flex flex-col justify-center px-8 md:px-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              PREMIUM SUPPLEMENTS
            </h1>
            <p className="text-xl text-white max-w-2xl">
              Fuel your performance with premium quality supplements designed
              for champions
            </p>
          </div>
        </div>

        {/* Mobile filter toggle */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold text-[#2C3E50]">Products</h1>
          <Button
            variant="outline"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 border-[#ce801f] text-[#ce801f] hover:bg-[#ce801f] hover:text-white"
          >
            <Filter className="h-5 w-5" />
            Filters
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-1/4 ${
              mobileFiltersOpen
                ? "block fixed inset-0 z-50 bg-white p-4 overflow-auto"
                : "hidden"
            } lg:block lg:static lg:z-auto lg:bg-transparent lg:p-0`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-20">
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-[#2C3E50]">FILTERS</h2>
                <div className="flex gap-3">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#ce801f] hover:underline font-medium"
                  >
                    Clear all
                  </button>
                  <button
                    className="lg:hidden text-gray-500"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-sm font-semibold mb-3 text-[#2C3E50] uppercase">
                  Search
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const searchInput = e.target.elements.search.value;
                    handleFilterChange("search", searchInput);
                  }}
                  className="relative"
                >
                  <Input
                    name="search"
                    placeholder="Search products..."
                    defaultValue={filters.search}
                    className="w-full pr-10 border-gray-300 focus:border-[#ce801f] focus:ring-[#ce801f]"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#ce801f] hover:text-[#E06A1A]"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Categories Filter */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#2C3E50] uppercase">
                    Categories
                  </h3>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div
                    className={`cursor-pointer hover:text-[#ce801f] transition-colors ${
                      filters.category === ""
                        ? "font-semibold text-[#ce801f]"
                        : "text-gray-600"
                    }`}
                    onClick={() => handleFilterChange("category", "")}
                  >
                    All Categories
                  </div>
                  {categories.map((category) => (
                    <div key={category.id} className="ml-3">
                      <div
                        className={`cursor-pointer hover:text-[#ce801f] flex items-center transition-colors ${
                          filters.category === category.slug
                            ? "font-semibold text-[#ce801f]"
                            : "text-gray-600"
                        }`}
                        onClick={() =>
                          handleFilterChange("category", category.slug)
                        }
                      >
                        <ChevronRight className="h-4 w-4 mr-1" />
                        {category.name}
                      </div>
                      {category.children && category.children.length > 0 && (
                        <div className="ml-6 mt-2 space-y-2">
                          {category.children.map((child) => (
                            <div
                              key={child.id}
                              className={`cursor-pointer hover:text-[#ce801f] text-sm transition-colors ${
                                filters.category === child.slug
                                  ? "font-semibold text-[#ce801f]"
                                  : "text-gray-600"
                              }`}
                              onClick={() =>
                                handleFilterChange("category", child.slug)
                              }
                            >
                              {child.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flavors Filter */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#2C3E50] uppercase">
                    Flavor
                  </h3>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div
                    className={`cursor-pointer hover:text-[#ce801f] transition-colors ${
                      selectedFlavors.length === 0
                        ? "font-semibold text-[#ce801f]"
                        : "text-gray-600"
                    }`}
                    onClick={() => {
                      setSelectedFlavors([]);
                      handleFilterChange("flavor", "");
                    }}
                  >
                    All Flavors
                  </div>

                  {flavors.map((flavor) => (
                    <div
                      key={flavor.id}
                      className={`cursor-pointer hover:text-[#ce801f] ml-3 flex items-center transition-colors ${
                        selectedFlavors.includes(flavor.id)
                          ? "font-semibold text-[#ce801f]"
                          : "text-gray-600"
                      }`}
                      onClick={() => handleFlavorChange(flavor.id)}
                    >
                      <div className="w-4 h-4 border-2 border-gray-300 rounded mr-3 flex items-center justify-center">
                        {selectedFlavors.includes(flavor.id) && (
                          <div className="w-2 h-2 rounded-sm bg-[#ce801f]"></div>
                        )}
                      </div>
                      {flavor.image && (
                        <div className="w-4 h-4 rounded-full overflow-hidden mr-2">
                          <Image
                            src={flavor.image || "/placeholder.svg"}
                            alt={flavor.name}
                            width={16}
                            height={16}
                          />
                        </div>
                      )}
                      {flavor.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Weights Filter */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#2C3E50] uppercase">
                    Weight
                  </h3>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <div
                    className={`cursor-pointer hover:text-[#ce801f] transition-colors ${
                      selectedWeights.length === 0
                        ? "font-semibold text-[#ce801f]"
                        : "text-gray-600"
                    }`}
                    onClick={() => {
                      setSelectedWeights([]);
                      handleFilterChange("weight", "");
                    }}
                  >
                    All Weights
                  </div>

                  {weights.map((weight) => (
                    <div
                      key={weight.id}
                      className={`cursor-pointer hover:text-[#ce801f] ml-3 flex items-center transition-colors ${
                        selectedWeights.includes(weight.id)
                          ? "font-semibold text-[#ce801f]"
                          : "text-gray-600"
                      }`}
                      onClick={() => handleWeightChange(weight.id)}
                    >
                      <div className="w-4 h-4 border-2 border-gray-300 rounded mr-3 flex items-center justify-center">
                        {selectedWeights.includes(weight.id) && (
                          <div className="w-2 h-2 rounded-sm bg-[#ce801f]"></div>
                        )}
                      </div>
                      {weight.display}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Header with count and sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-[#2C3E50] mb-4 sm:mb-0">
                {loading && !products.length ? (
                  <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <div className="text-lg">
                    Showing{" "}
                    <span className="font-bold text-[#ce801f]">
                      {products.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-[#ce801f]">
                      {pagination.total || 0}
                    </span>{" "}
                    products
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {loading && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <div className="w-4 h-4 border-2 border-[#ce801f] border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </div>
                )}

                <div className="flex items-center bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <span className="px-4 py-2 text-sm font-medium text-[#2C3E50]">
                    SORT BY
                  </span>
                  <select
                    className="border-l border-gray-200 px-4 py-2 focus:outline-none bg-white text-[#2C3E50]"
                    onChange={handleSortChange}
                    disabled={loading}
                    value={
                      filters.sort === "createdAt" && filters.order === "desc"
                        ? "newest"
                        : filters.sort === "createdAt" &&
                          filters.order === "asc"
                        ? "oldest"
                        : filters.sort === "name" && filters.order === "asc"
                        ? "name-asc"
                        : filters.sort === "name" && filters.order === "desc"
                        ? "name-desc"
                        : "newest"
                    }
                  >
                    <option value="newest">Featured</option>
                    <option value="price-low">Price, low to high</option>
                    <option value="price-high">Price, high to low</option>
                    <option value="name-asc">Alphabetically, A-Z</option>
                    <option value="name-desc">Alphabetically, Z-A</option>
                    <option value="oldest">Date, old to new</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.search ||
              filters.category ||
              selectedFlavors.length > 0 ||
              selectedWeights.length > 0 ||
              filters.minPrice ||
              filters.maxPrice) && (
              <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <span className="text-sm font-semibold text-[#2C3E50]">
                  Active Filters:
                </span>

                {filters.search && (
                  <div className="bg-[#ce801f] text-white text-sm px-3 py-1 rounded-full flex items-center">
                    <span>Search: {filters.search}</span>
                    <button
                      onClick={() => handleFilterChange("search", "")}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {filters.category && (
                  <div className="bg-[#ce801f] text-white text-sm px-3 py-1 rounded-full flex items-center">
                    <span>
                      Category:{" "}
                      {categories.find((c) => c.slug === filters.category)
                        ?.name || filters.category}
                    </span>
                    <button
                      onClick={() => handleFilterChange("category", "")}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {selectedFlavors.length > 0 && (
                  <div className="bg-[#ce801f] text-white text-sm px-3 py-1 rounded-full flex items-center">
                    <span>
                      Flavor:{" "}
                      {flavors.find((f) => f.id === selectedFlavors[0])?.name ||
                        selectedFlavors[0]}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedFlavors([]);
                        handleFilterChange("flavor", "");
                      }}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {selectedWeights.length > 0 && (
                  <div className="bg-[#ce801f] text-white text-sm px-3 py-1 rounded-full flex items-center">
                    <span>
                      Weight:{" "}
                      {weights.find((w) => w.id === selectedWeights[0])
                        ?.display || selectedWeights[0]}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedWeights([]);
                        handleFilterChange("weight", "");
                      }}
                      className="ml-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <button
                  onClick={clearFilters}
                  className="text-sm text-[#ce801f] underline font-medium ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Products Grid */}
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(pagination.limit || 12)].map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-gray-200">
                <div className="text-gray-400 mb-6">
                  <AlertCircle className="h-16 w-16 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-[#2C3E50] mb-4">
                  No products found
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn&apos;t find any products matching your criteria. Try
                  adjusting your filters or search term.
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-[#ce801f] hover:bg-[#E06A1A] text-white px-8 py-3 rounded-lg font-semibold"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group"
                  >
                    <div className="relative h-64 w-full bg-gray-50 overflow-hidden">
                      <Link href={`/products/${product.slug}`}>
                        <Image
                          src={product.image || "/product-placeholder.jpg"}
                          alt={product.name}
                          fill
                          className="object-contain p-4 transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </Link>

                      {product.hasSale && (
                        <span className="absolute top-3 left-3 bg-[#ce801f] text-white text-xs font-bold px-3 py-1 rounded-full">
                          SALE
                        </span>
                      )}

                      <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 p-0 bg-white/90 hover:bg-[#ce801f] hover:text-white rounded-full shadow-sm"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 p-0 bg-white/90 hover:bg-[#ce801f] hover:text-white rounded-full shadow-sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleQuickView(product);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="p-6">
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
                        className="block hover:text-[#ce801f] transition-colors"
                      >
                        <h3 className="font-semibold text-[#2C3E50] mb-3 line-clamp-2 text-center">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="text-center mb-4">
                        {product.hasSale ? (
                          <div className="flex items-center justify-center space-x-2">
                            <span className="font-bold text-xl text-[#ce801f]">
                              {formatCurrency(product.basePrice)}
                            </span>
                            <span className="text-gray-500 line-through text-sm">
                              {formatCurrency(product.regularPrice)}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-xl text-[#2C3E50]">
                            {formatCurrency(product.basePrice)}
                          </span>
                        )}
                      </div>

                      {product.flavors > 1 && (
                        <p className="text-xs text-gray-500 text-center mb-4">
                          {product.flavors} variants
                        </p>
                      )}

                      <Button
                        className="w-full bg-[#ce801f] hover:bg-[#E06A1A] text-white font-semibold py-3 rounded-lg transition-colors duration-300"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product);
                        }}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center mt-12">
                <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1 || loading}
                    className="rounded-none border-0 hover:bg-[#ce801f] hover:text-white px-4 py-3"
                  >
                    <ChevronUp className="h-4 w-4 rotate-90" />
                  </Button>

                  {[...Array(pagination.pages)].map((_, i) => {
                    const page = i + 1;
                    if (
                      page === 1 ||
                      page === pagination.pages ||
                      (page >= pagination.page - 1 &&
                        page <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className={`px-4 py-3 font-medium transition-colors ${
                            pagination.page === page
                              ? "bg-[#ce801f] text-white"
                              : "hover:bg-gray-50 text-[#2C3E50]"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }

                    if (
                      (page === 2 && pagination.page > 3) ||
                      (page === pagination.pages - 1 &&
                        pagination.page < pagination.pages - 2)
                    ) {
                      return (
                        <span key={page} className="px-4 py-3 text-gray-400">
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages || loading}
                    className="rounded-none border-0 hover:bg-[#ce801f] hover:text-white px-4 py-3"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick View Dialog */}
        <ProductQuickView
          product={quickViewProduct}
          open={quickViewOpen}
          onOpenChange={setQuickViewOpen}
        />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#ce801f] border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
