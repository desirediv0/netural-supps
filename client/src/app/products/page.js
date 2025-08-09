"use client";

import { useState, useEffect, Suspense } from "react";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ProducCard";
import { fetchApi } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertCircle,
  Search,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import ProductQuickView from "@/components/ProductQuickView";
import { toast } from "sonner";

// Product Card Skeleton
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-64 w-full bg-gradient-to-br from-gray-100 to-gray-200"></div>
      <div className="p-6">
        <div className="flex justify-center mb-3">
          <div className="h-4 w-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-4 w-full bg-gray-200 rounded-lg mb-3"></div>
        <div className="h-4 w-3/4 mx-auto bg-gray-200 rounded-lg mb-4"></div>
        <div className="flex justify-center">
          <div className="h-6 w-16 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-12 w-full bg-gray-200 rounded-xl mt-4"></div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get("search") || "";
  const categorySlug = searchParams.get("category") || "";
  const flavorId = searchParams.get("flavor") || "";
  const weightId = searchParams.get("weight") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortParam = searchParams.get("sort") || "createdAt";
  const orderParam = searchParams.get("order") || "desc";

  // Determine which section should be open based on URL params
  const getInitialActiveSection = () => {
    if (searchQuery) return "search";
    if (categorySlug) return "categories";
    if (flavorId) return "flavors";
    if (weightId) return "weights";
    return "search"; // default to search if no filters are active
  };

  const [activeFilterSection, setActiveFilterSection] = useState(
    getInitialActiveSection()
  );

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [flavors, setFlavors] = useState([]);
  const [weights, setWeights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  // Initialize selected filters from URL params
  const [selectedFlavors, setSelectedFlavors] = useState(
    flavorId ? [flavorId] : []
  );
  const [selectedWeights, setSelectedWeights] = useState(
    weightId ? [weightId] : []
  );

  // Restore the price range states
  const [priceRange, setPriceRange] = useState([
    minPrice ? parseInt(minPrice) : 0,
    maxPrice ? parseInt(maxPrice) : 1000,
  ]);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(1000);

  const [filters, setFilters] = useState({
    search: searchQuery,
    category: categorySlug,
    flavor: flavorId,
    weight: weightId,
    minPrice: minPrice,
    maxPrice: maxPrice,
    sort: sortParam,
    order: orderParam,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 0,
  });

  const { isAuthenticated } = useAuth();

  // Add function to handle filter section toggle
  const toggleFilterSection = (section) => {
    setActiveFilterSection(activeFilterSection === section ? null : section);
  };

  // Function to update URL with current filters
  const updateURL = (newFilters) => {
    const params = new URLSearchParams();

    // Only add parameters that have values
    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.category) params.set("category", newFilters.category);
    if (newFilters.flavor) params.set("flavor", newFilters.flavor);
    if (newFilters.weight) params.set("weight", newFilters.weight);
    if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
    if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
    if (newFilters.sort !== "createdAt" || newFilters.order !== "desc") {
      params.set("sort", newFilters.sort);
      params.set("order", newFilters.order);
    }

    // Update URL without refreshing the page
    const newURL = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.push(newURL, { scroll: false });
  };

  // Fetch products based on filters useEffect
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build query params from filters
        const queryParams = new URLSearchParams();

        queryParams.append("page", pagination.page);
        queryParams.append("limit", pagination.limit);

        // Ensure sort is a valid field in the backend
        const validSortFields = ["createdAt", "updatedAt", "name", "featured"];
        let sortField = filters.sort;

        // Default to createdAt if the sort field is not valid
        if (!validSortFields.includes(sortField)) {
          sortField = "createdAt";
          console.warn(
            `Invalid sort field: ${filters.sort}, using createdAt instead`
          );
        }

        queryParams.append("sort", sortField);
        queryParams.append("order", filters.order);

        // Add other non-variant filters
        if (filters.search) queryParams.append("search", filters.search);
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
        if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);

        // Add flavor and weight filters individually
        // The server should return any product that has at least one matching flavor OR weight
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

        // If both flavor AND weight filters are active, we need to do client-side filtering
        // to ensure we only show products that have variants with BOTH the selected flavor AND weight
        if (
          selectedFlavors.length > 0 &&
          selectedWeights.length > 0 &&
          filteredProducts.length > 0
        ) {
          // For each product, check if it has any variant that matches both flavor and weight
          const productsWithExactMatch = [];

          for (const product of filteredProducts) {
            try {
              // Fetch detailed product info including all variants
              const detailResponse = await fetchApi(
                `/public/products/${product.slug}`
              );
              const detailedProduct = detailResponse.data.product;

              // Check if any variant has both the selected flavor AND weight
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

          // Update the filtered list and pagination count
          filteredProducts = productsWithExactMatch;
          setPagination({
            ...response.data.pagination,
            total: productsWithExactMatch.length,
          });
        } else {
          // Just use the server response directly
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

  // Add useEffect to handle scroll on page change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [pagination.page]); // This will trigger whenever the page changes

  // Modify handleFilterChange to update URL
  const handleFilterChange = (name, value) => {
    // For number inputs, ensure we're handling empty strings and non-numeric values
    if ((name === "minPrice" || name === "maxPrice") && value !== "") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return; // Don't update if not a valid number
      }
      value = numValue.toString();
    }

    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    updateURL(newFilters);

    // Reset to page 1 when filters change
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }

    // Close mobile filters after selecting a filter on mobile
    if (
      mobileFiltersOpen &&
      window.innerWidth < 768 &&
      name !== "minPrice" &&
      name !== "maxPrice" &&
      name !== "search"
    ) {
      setMobileFiltersOpen(false);
    }

    // Open the corresponding section when a filter is applied
    switch (name) {
      case "search":
        if (value) setActiveFilterSection("search");
        break;
      case "category":
        if (value) setActiveFilterSection("categories");
        break;
      case "flavor":
        if (value) setActiveFilterSection("flavors");
        break;
      case "weight":
        if (value) setActiveFilterSection("weights");
        break;
    }
  };

  // Modify handleFlavorChange
  const handleFlavorChange = (flavorId) => {
    const isAlreadySelected = selectedFlavors.includes(flavorId);
    let updatedFlavors;

    if (isAlreadySelected) {
      updatedFlavors = selectedFlavors.filter((id) => id !== flavorId);
      setSelectedFlavors(updatedFlavors);
    } else {
      updatedFlavors = [flavorId];
      setSelectedFlavors(updatedFlavors);
    }

    const newFlavorValue = updatedFlavors.length > 0 ? updatedFlavors[0] : "";
    handleFilterChange("flavor", newFlavorValue);
  };

  // Modify handleWeightChange
  const handleWeightChange = (weightId) => {
    const isAlreadySelected = selectedWeights.includes(weightId);
    let updatedWeights;

    if (isAlreadySelected) {
      updatedWeights = selectedWeights.filter((id) => id !== weightId);
      setSelectedWeights(updatedWeights);
    } else {
      updatedWeights = [weightId];
      setSelectedWeights(updatedWeights);
    }

    const newWeightValue = updatedWeights.length > 0 ? updatedWeights[0] : "";
    handleFilterChange("weight", newWeightValue);
  };

  // Modify clearFilters to also clear URL
  const clearFilters = () => {
    const clearedFilters = {
      search: "",
      category: "",
      flavor: "",
      weight: "",
      minPrice: "",
      maxPrice: "",
      sort: "createdAt",
      order: "desc",
    };
    setFilters(clearedFilters);
    setSelectedFlavors([]);
    setSelectedWeights([]);
    updateURL(clearedFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    setActiveFilterSection("search");
  };

  // Handle sort change
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
        // Looking at the backend code, we need to use a field that exists in the product model
        // Using createdAt as a fallback since price doesn't exist on the product model
        handleFilterChange("sort", "createdAt");
        handleFilterChange("order", "asc");
        break;
      case "price-high":
        // Looking at the backend code, we need to use a field that exists in the product model
        // Using createdAt as a fallback since price doesn't exist on the product model
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

  // Add this function to handle scrolling
  const scrollToTop = () => {
    const mainContent = document.getElementById("products-main");
    if (mainContent) {
      mainContent.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // Update handlePageChange to use the scroll function
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    setPagination((prev) => ({ ...prev, page: newPage }));
    scrollToTop();
  };

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen"
      id="products-main"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="relative w-full h-[300px] mb-12 rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src="/banner-background.jpg"
            alt="Premium Supplements"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-800/70 to-orange-600/60 flex flex-col justify-center px-8 md:px-12">
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
        <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <Button
            variant="outline"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white rounded-xl"
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
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-20">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800">FILTERS</h2>
                <div className="flex gap-3">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Clear all
                  </button>
                  <button
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-sm font-semibold mb-3 text-gray-800 uppercase">
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
                    className="w-full pr-10 border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-600"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </form>
              </div>

              {/* Categories Filter */}
              <div className="p-6 border-b border-gray-100">
                <div
                  className="flex items-center justify-between mb-3 cursor-pointer"
                  onClick={() => toggleFilterSection("categories")}
                >
                  <h3 className="text-sm font-semibold text-gray-800 uppercase">
                    Categories
                  </h3>
                  {activeFilterSection === "categories" ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                {activeFilterSection === "categories" && (
                  <div className="space-y-3">
                    <div
                      className={`cursor-pointer hover:text-orange-500 transition-colors ${
                        filters.category === ""
                          ? "font-semibold text-orange-500"
                          : "text-gray-600"
                      }`}
                      onClick={() => handleFilterChange("category", "")}
                    >
                      All Categories
                    </div>
                    {categories.map((category) => (
                      <div key={category.id} className="ml-3">
                        <div
                          className={`cursor-pointer hover:text-orange-500 flex items-center transition-colors ${
                            filters.category === category.slug
                              ? "font-semibold text-orange-500"
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
                                className={`cursor-pointer hover:text-orange-500 text-sm transition-colors ${
                                  filters.category === child.slug
                                    ? "font-semibold text-orange-500"
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
                )}
              </div>

              {/* Flavors Filter */}
              <div className="p-6 border-b border-gray-100">
                <div
                  className="flex items-center justify-between mb-3 cursor-pointer"
                  onClick={() => toggleFilterSection("flavors")}
                >
                  <h3 className="text-sm font-semibold text-[#2C3E50] uppercase">
                    Flavor
                  </h3>
                  {activeFilterSection === "flavors" ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                {activeFilterSection === "flavors" && (
                  <div className="space-y-3">
                    <div
                      className={`cursor-pointer hover:text-orange-500 transition-colors ${
                        selectedFlavors.length === 0
                          ? "font-semibold text-orange-500"
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
                        className={`cursor-pointer hover:text-orange-500 ml-3 flex items-center transition-colors ${
                          selectedFlavors.includes(flavor.id)
                            ? "font-semibold text-orange-500"
                            : "text-gray-600"
                        }`}
                        onClick={() => handleFlavorChange(flavor.id)}
                      >
                        <div className="w-4 h-4 border-2 border-gray-300 rounded mr-3 flex items-center justify-center">
                          {selectedFlavors.includes(flavor.id) && (
                            <div className="w-2 h-2 rounded-sm bg-orange-500"></div>
                          )}
                        </div>
                        {flavor.image && (
                          <div className="w-4 h-4 rounded-full overflow-hidden mr-2">
                            <Image
                              src={flavor.image || "/placeholder.jpg"}
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
                )}
              </div>

              {/* Weights Filter */}
              <div className="p-6">
                <div
                  className="flex items-center justify-between mb-3 cursor-pointer"
                  onClick={() => toggleFilterSection("weights")}
                >
                  <h3 className="text-sm font-semibold text-[#2C3E50] uppercase">
                    Weight
                  </h3>
                  {activeFilterSection === "weights" ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                {activeFilterSection === "weights" && (
                  <div className="space-y-3">
                    <div
                      className={`cursor-pointer hover:text-orange-500 transition-colors ${
                        selectedWeights.length === 0
                          ? "font-semibold text-orange-500"
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
                        className={`cursor-pointer hover:text-orange-500 ml-3 flex items-center transition-colors ${
                          selectedWeights.includes(weight.id)
                            ? "font-semibold text-orange-500"
                            : "text-gray-600"
                        }`}
                        onClick={() => handleWeightChange(weight.id)}
                      >
                        <div className="w-4 h-4 border-2 border-gray-300 rounded mr-3 flex items-center justify-center">
                          {selectedWeights.includes(weight.id) && (
                            <div className="w-2 h-2 rounded-sm bg-orange-500"></div>
                          )}
                        </div>
                        {weight.display}
                      </div>
                    ))}
                  </div>
                )}
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
                    <span className="font-bold text-orange-500">
                      {products.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-orange-500">
                      {pagination.total || 0}
                    </span>{" "}
                    products
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {loading && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-2"></div>
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
                  <div className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full flex items-center">
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
                  <div className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full flex items-center">
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
                  <div className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full flex items-center">
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
                  <div className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full flex items-center">
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
                  className="text-sm text-orange-500 underline font-medium ml-2"
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
              <div className="bg-white p-12 rounded-2xl shadow-xl text-center border border-gray-100">
                <div className="text-gray-400 mb-6">
                  <AlertCircle className="h-16 w-16 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  No products found
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn&apos;t find any products matching your criteria. Try
                  adjusting your filters or search term.
                </p>
                <Button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
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
                    className="rounded-none border-0 hover:bg-orange-500 hover:text-white px-4 py-3"
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
                              ? "bg-orange-500 text-white"
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
                    className="rounded-none border-0 hover:bg-orange-500 hover:text-white px-4 py-3"
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
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
