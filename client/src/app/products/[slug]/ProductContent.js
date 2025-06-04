"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Star,
  Minus,
  Plus,
  AlertCircle,
  ShoppingCart,
  Heart,
  ChevronRight,
  CheckCircle,
  Shield,
  Truck,
  Award,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import ReviewSection from "./ReviewSection";

export default function ProductContent({ slug }) {
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [selectedShade, setSelectedShade] = useState(null);
  const [availableCombinations, setAvailableCombinations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  const { addToCart } = useCart();

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setInitialLoading(true);
      try {
        const response = await fetchApi(`/public/products/${slug}`);
        const productData = response.data.product;
        setProduct(productData);
        setRelatedProducts(response.data.relatedProducts || []);

        if (productData.images && productData.images.length > 0) {
          setMainImage(productData.images[0]);
        }

        if (productData.variants && productData.variants.length > 0) {
          const combinations = productData.variants
            .filter((v) => v.isActive && v.quantity > 0)
            .map((variant) => ({
              flavorId: variant.flavorId,
              weightId: variant.weightId,
              variant: variant,
            }));

          setAvailableCombinations(combinations);

          if (
            productData.flavorOptions &&
            productData.flavorOptions.length > 0
          ) {
            const firstFlavor = productData.flavorOptions[0];
            setSelectedFlavor(firstFlavor);

            const matchingVariant = combinations.find(
              (combo) => combo.flavorId === firstFlavor.id
            );

            if (matchingVariant && productData.weightOptions) {
              const matchingWeight = productData.weightOptions.find(
                (weight) => weight.id === matchingVariant.weightId
              );

              if (matchingWeight) {
                setSelectedWeight(matchingWeight);
                setSelectedVariant(matchingVariant.variant);
              }
            }
          } else if (productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  const isCombinationAvailable = (flavorId, weightId) => {
    return availableCombinations.some(
      (combo) => combo.flavorId === flavorId && combo.weightId === weightId
    );
  };

  const getAvailableWeightsForFlavor = (flavorId) => {
    const availableWeights = availableCombinations
      .filter((combo) => combo.flavorId === flavorId)
      .map((combo) => combo.weightId);

    return availableWeights;
  };

  const getAvailableFlavorsForWeight = (weightId) => {
    const availableFlavors = availableCombinations
      .filter((combo) => combo.weightId === weightId)
      .map((combo) => combo.flavorId);

    return availableFlavors;
  };

  const handleFlavorChange = (flavor) => {
    setSelectedFlavor(flavor);

    const availableWeightIds = getAvailableWeightsForFlavor(flavor.id);

    if (product?.weightOptions?.length > 0 && availableWeightIds.length > 0) {
      if (selectedWeight && availableWeightIds.includes(selectedWeight.id)) {
        const matchingVariant = availableCombinations.find(
          (combo) =>
            combo.flavorId === flavor.id && combo.weightId === selectedWeight.id
        );

        if (matchingVariant) {
          setSelectedVariant(matchingVariant.variant);
        }
      } else {
        const firstAvailableWeight = product.weightOptions.find((weight) =>
          availableWeightIds.includes(weight.id)
        );

        if (firstAvailableWeight) {
          setSelectedWeight(firstAvailableWeight);

          const matchingVariant = availableCombinations.find(
            (combo) =>
              combo.flavorId === flavor.id &&
              combo.weightId === firstAvailableWeight.id
          );

          if (matchingVariant) {
            setSelectedVariant(matchingVariant.variant);
          }
        }
      }
    } else {
      setSelectedWeight(null);
      setSelectedVariant(null);
    }
  };

  const handleWeightChange = (weight) => {
    setSelectedWeight(weight);

    const availableFlavorIds = getAvailableFlavorsForWeight(weight.id);

    if (product?.flavorOptions?.length > 0 && availableFlavorIds.length > 0) {
      if (selectedFlavor && availableFlavorIds.includes(selectedFlavor.id)) {
        const matchingVariant = availableCombinations.find(
          (combo) =>
            combo.weightId === weight.id && combo.flavorId === selectedFlavor.id
        );

        if (matchingVariant) {
          setSelectedVariant(matchingVariant.variant);
        }
      } else {
        const firstAvailableFlavor = product.flavorOptions.find((flavor) =>
          availableFlavorIds.includes(flavor.id)
        );

        if (firstAvailableFlavor) {
          setSelectedFlavor(firstAvailableFlavor);

          const matchingVariant = availableCombinations.find(
            (combo) =>
              combo.weightId === weight.id &&
              combo.flavorId === firstAvailableFlavor.id
          );

          if (matchingVariant) {
            setSelectedVariant(matchingVariant.variant);
          }
        }
      }
    } else {
      setSelectedFlavor(null);
      setSelectedVariant(null);
    }
  };

  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !product) return;

      try {
        const response = await fetchApi("/users/wishlist", {
          credentials: "include",
        });

        const wishlistItems = response.data.wishlistItems || [];
        const inWishlist = wishlistItems.some(
          (item) => item.productId === product.id
        );
        setIsInWishlist(inWishlist);
      } catch (error) {
        console.error("Failed to check wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [isAuthenticated, product]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity < 1) return;
    if (
      selectedVariant &&
      selectedVariant.quantity > 0 &&
      newQuantity > selectedVariant.quantity
    )
      return;
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      if (product?.variants && product.variants.length > 0) {
        setIsAddingToCart(true);
        setCartSuccess(false);

        try {
          await addToCart(product.variants[0].id, quantity);
          setCartSuccess(true);

          setTimeout(() => {
            setCartSuccess(false);
          }, 3000);
        } catch (err) {
          console.error("Error adding to cart:", err);
        } finally {
          setIsAddingToCart(false);
        }
      }
      return;
    }

    setIsAddingToCart(true);
    setCartSuccess(false);

    try {
      await addToCart(selectedVariant.id, quantity);
      setCartSuccess(true);

      setTimeout(() => {
        setCartSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderImages = () => {
    if (!product || !product.images || product.images.length === 0) {
      return (
        <div className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <Image
            src="/images/product-placeholder.jpg"
            alt={product?.name || "Product"}
            fill
            className="object-contain p-6"
            priority
          />
        </div>
      );
    }

    if (product.images.length === 1) {
      return (
        <div className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <Image
            src={getImageUrl(product.images[0].url) || "/placeholder.svg"}
            alt={product?.name || "Product"}
            fill
            className="object-contain p-6"
            priority
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="relative aspect-square w-full bg-gray-50 rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <Image
            src={getImageUrl(mainImage?.url || product.images[0].url)}
            alt={product?.name || "Product"}
            fill
            className="object-contain p-6"
            priority
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {product.images.map((image, index) => (
            <div
              key={index}
              className={`relative aspect-square w-full bg-gray-50 rounded-lg overflow-hidden cursor-pointer border-3 transition-all hover:shadow-md ${
                mainImage?.url === image.url
                  ? "border-[#F47C20] shadow-lg"
                  : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => setMainImage(image)}
            >
              <Image
                src={getImageUrl(image.url) || "/placeholder.svg"}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-contain p-2"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getImageUrl = (image) => {
    if (!image) return "/images/product-placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
  };

  const getPriceDisplay = () => {
    if (initialLoading) {
      return (
        <div className="h-10 w-40 bg-gray-200 animate-pulse rounded"></div>
      );
    }

    if (selectedVariant) {
      if (selectedVariant.salePrice && selectedVariant.salePrice > 0) {
        return (
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-[#F47C20]">
              {formatCurrency(selectedVariant.salePrice)}
            </span>
            <span className="text-2xl text-gray-500 line-through">
              {formatCurrency(selectedVariant.price)}
            </span>
          </div>
        );
      }

      return (
        <span className="text-4xl font-bold text-[#2C3E50]">
          {formatCurrency(selectedVariant.price || 0)}
        </span>
      );
    }

    if (product) {
      if (product.hasSale && product.basePrice > 0) {
        return (
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-[#F47C20]">
              {formatCurrency(product.basePrice)}
            </span>
            <span className="text-2xl text-gray-500 line-through">
              {formatCurrency(product.regularPrice || 0)}
            </span>
          </div>
        );
      }

      return (
        <span className="text-4xl font-bold text-[#2C3E50]">
          {formatCurrency(product.basePrice || 0)}
        </span>
      );
    }

    return null;
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }

    setIsAddingToWishlist(true);

    try {
      if (isInWishlist) {
        const wishlistResponse = await fetchApi("/users/wishlist", {
          credentials: "include",
        });

        const wishlistItem = wishlistResponse.data.wishlistItems.find(
          (item) => item.productId === product.id
        );

        if (wishlistItem) {
          await fetchApi(`/users/wishlist/${wishlistItem.id}`, {
            method: "DELETE",
            credentials: "include",
          });

          setIsInWishlist(false);
        }
      } else {
        await fetchApi("/users/wishlist", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ productId: product.id }),
        });

        setIsInWishlist(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-[#F47C20] border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-[#2C3E50] text-lg font-medium">
              Loading product details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200 flex flex-col items-center text-center max-w-md mx-auto">
            <AlertCircle className="text-red-500 h-16 w-16 mb-6" />
            <h2 className="text-2xl font-bold text-red-700 mb-4">
              Error Loading Product
            </h2>
            <p className="text-red-600 mb-8">{error}</p>
            <Link href="/products">
              <Button className="bg-[#F47C20] hover:bg-[#E06A1A] text-white px-8 py-3 rounded-lg font-semibold">
                <ChevronRight className="mr-2 h-4 w-4" /> Browse Other Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-yellow-200 flex flex-col items-center text-center max-w-md mx-auto">
            <AlertCircle className="text-yellow-500 h-16 w-16 mb-6" />
            <h2 className="text-2xl font-bold text-yellow-700 mb-4">
              Product Not Found
            </h2>
            <p className="text-yellow-600 mb-8">
              The product you are looking for does not exist or has been
              removed.
            </p>
            <Link href="/products">
              <Button className="bg-[#F47C20] hover:bg-[#E06A1A] text-white px-8 py-3 rounded-lg font-semibold">
                <ChevronRight className="mr-2 h-4 w-4" /> Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm mb-8 bg-white p-4 rounded-lg shadow-sm">
          <Link
            href="/"
            className="text-gray-500 hover:text-[#F47C20] transition-colors"
          >
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link
            href="/products"
            className="text-gray-500 hover:text-[#F47C20] transition-colors"
          >
            Products
          </Link>
          {product?.categories?.[0] && (
            <>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <Link
                href={`/category/${product.categories[0].slug}`}
                className="text-gray-500 hover:text-[#F47C20] transition-colors"
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-[#F47C20] font-medium">{product?.name}</span>
        </div>

        {/* Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div>
            {loading ? (
              <div className="aspect-square w-full bg-gray-200 rounded-xl animate-pulse"></div>
            ) : error ? (
              <div className="aspect-square w-full bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center p-6">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            ) : (
              renderImages()
            )}
          </div>

          {/* Right Column - Product Details */}
          <div className="flex flex-col bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            {/* Brand name if available */}
            {product.brand && (
              <div className="text-[#F47C20] text-sm font-medium mb-2">
                {product.brand}
              </div>
            )}

            {/* Product name */}
            <h1 className="text-3xl lg:text-4xl font-bold text-[#2C3E50] mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center mb-6">
              <div className="flex text-yellow-400 mr-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5"
                    fill={
                      i < Math.round(product.avgRating || 0)
                        ? "currentColor"
                        : "none"
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {product.avgRating
                  ? `${product.avgRating} (${product.reviewCount} reviews)`
                  : "No reviews yet"}
              </span>
            </div>

            {/* Price */}
            <div className="mb-8">{getPriceDisplay()}</div>

            {/* Short Description */}
            <div className="p-6 border border-gray-200 rounded-lg mb-8 bg-gray-50">
              <p className="text-gray-700 leading-relaxed">
                {product.shortDescription ||
                  product.description?.substring(0, 150)}
                {product.description?.length > 150 &&
                  !product.shortDescription &&
                  "..."}
              </p>
            </div>

            {/* Flavor Selection */}
            {product.flavorOptions && product.flavorOptions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#2C3E50] mb-4">
                  Choose Flavor
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.flavorOptions.map((flavor) => {
                    const availableWeightIds = getAvailableWeightsForFlavor(
                      flavor.id
                    );
                    const isAvailable = availableWeightIds.length > 0;

                    return (
                      <button
                        key={flavor.id}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedFlavor?.id === flavor.id
                            ? "border-[#F47C20] bg-[#F47C20] text-white shadow-lg"
                            : isAvailable
                            ? "border-gray-300 hover:border-[#F47C20] hover:text-[#F47C20]"
                            : "border-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => handleFlavorChange(flavor)}
                        disabled={!isAvailable}
                      >
                        {flavor.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Weight Selection */}
            {product.weightOptions && product.weightOptions.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#2C3E50] mb-4">
                  Choose Weight
                </h3>
                <div className="flex flex-wrap gap-3">
                  {product.weightOptions.map((weight) => {
                    const availableFlavorIds = getAvailableFlavorsForWeight(
                      weight.id
                    );
                    const isAvailable = selectedFlavor
                      ? availableCombinations.some(
                          (combo) =>
                            combo.flavorId === selectedFlavor.id &&
                            combo.weightId === weight.id
                        )
                      : availableFlavorIds.length > 0;

                    return (
                      <button
                        key={weight.id}
                        className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          selectedWeight?.id === weight.id
                            ? "border-[#F47C20] bg-[#F47C20] text-white shadow-lg"
                            : isAvailable
                            ? "border-gray-300 hover:border-[#F47C20] hover:text-[#F47C20]"
                            : "border-gray-200 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={() => handleWeightChange(weight)}
                        disabled={!isAvailable}
                      >
                        {weight.display}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Success/Error Messages */}
            {cartSuccess && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm rounded-lg flex items-center border border-green-200">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">
                  Item successfully added to your cart!
                </span>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {selectedVariant && selectedVariant.quantity > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">
                    In Stock ({selectedVariant.quantity} available)
                  </span>
                </div>
              )}
              {selectedVariant && selectedVariant.quantity === 0 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">Out of stock</span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[#2C3E50] mb-4">
                Quantity
              </h3>
              <div className="flex items-center">
                <button
                  className="p-3 border-2 border-gray-300 rounded-l-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1 || isAddingToCart}
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="px-8 py-3 border-t-2 border-b-2 border-gray-300 min-w-[4rem] text-center font-bold text-lg text-[#2C3E50]">
                  {quantity}
                </span>
                <button
                  className="p-3 border-2 border-gray-300 rounded-r-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleQuantityChange(1)}
                  disabled={
                    (selectedVariant &&
                      selectedVariant.quantity > 0 &&
                      quantity >= selectedVariant.quantity) ||
                    isAddingToCart
                  }
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                className="flex-1 flex items-center justify-center gap-3 py-4 text-lg bg-[#F47C20] hover:bg-[#E06A1A] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                size="lg"
                onClick={handleAddToCart}
                disabled={
                  isAddingToCart ||
                  (selectedVariant && selectedVariant.quantity < 1) ||
                  (!selectedVariant &&
                    (!product?.variants ||
                      product.variants.length === 0 ||
                      product.variants[0].quantity < 1))
                }
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Add to Cart
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className={`rounded-lg py-4 px-6 border-2 font-semibold transition-all ${
                  isInWishlist
                    ? "text-red-600 border-red-600 hover:bg-red-50"
                    : "border-[#2C3E50] text-[#2C3E50] hover:bg-[#2C3E50] hover:text-white"
                }`}
                size="icon"
                onClick={handleAddToWishlist}
                disabled={isAddingToWishlist}
              >
                <Heart
                  className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`}
                />
              </Button>
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Shield className="h-5 w-5 text-[#F47C20] mr-2" />
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Truck className="h-5 w-5 text-[#F47C20] mr-2" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Award className="h-5 w-5 text-[#F47C20] mr-2" />
                <span>Lab Tested</span>
              </div>
            </div>

            {/* Product Metadata */}
            <div className="border-t border-gray-200 pt-6 mt-6 space-y-3 text-sm">
              {selectedVariant && selectedVariant.sku && (
                <div className="flex">
                  <span className="font-semibold w-32 text-[#2C3E50]">
                    SKU:
                  </span>
                  <span className="text-gray-600">{selectedVariant.sku}</span>
                </div>
              )}

              {product.category && (
                <div className="flex">
                  <span className="font-semibold w-32 text-[#2C3E50]">
                    Category:
                  </span>
                  <Link
                    href={`/category/${product.category?.slug}`}
                    className="text-[#F47C20] hover:underline font-medium"
                  >
                    {product.category?.name}
                  </Link>
                </div>
              )}

              {product.tags && product.tags.length > 0 && (
                <div className="flex">
                  <span className="font-semibold w-32 text-[#2C3E50]">
                    Tags:
                  </span>
                  <div className="text-gray-600">
                    {product.tags?.map((tag, index) => (
                      <span key={index}>
                        <Link
                          href={`/products?tag=${tag}`}
                          className="text-[#F47C20] hover:underline font-medium"
                        >
                          {tag}
                        </Link>
                        {index < product.tags.length - 1 && ", "}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-16">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button
                className={`px-8 py-4 font-semibold text-sm uppercase transition-colors ${
                  activeTab === "description"
                    ? "border-b-3 border-[#F47C20] text-[#F47C20] bg-[#F47C20]/5"
                    : "text-gray-500 hover:text-[#2C3E50]"
                }`}
                onClick={() => setActiveTab("description")}
              >
                Description
              </button>
              <button
                className={`px-8 py-4 font-semibold text-sm uppercase transition-colors ${
                  activeTab === "reviews"
                    ? "border-b-3 border-[#F47C20] text-[#F47C20] bg-[#F47C20]/5"
                    : "text-gray-500 hover:text-[#2C3E50]"
                }`}
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({product.reviewCount || 0})
              </button>
              <button
                className={`px-8 py-4 font-semibold text-sm uppercase transition-colors ${
                  activeTab === "shipping"
                    ? "border-b-3 border-[#F47C20] text-[#F47C20] bg-[#F47C20]/5"
                    : "text-gray-500 hover:text-[#2C3E50]"
                }`}
                onClick={() => setActiveTab("shipping")}
              >
                Shipping & Returns
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === "description" && (
              <div className="prose max-w-none">
                <div className="mb-8">
                  <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                    {product.description}
                  </p>

                  {product.isSupplement && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      <div className="bg-[#F47C20]/5 p-6 rounded-xl border border-[#F47C20]/20">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-[#F47C20] text-white flex items-center justify-center flex-shrink-0 mr-4">
                            <CheckCircle className="h-6 w-6" />
                          </div>
                          <h3 className="text-xl font-bold text-[#2C3E50]">
                            Pure Quality
                          </h3>
                        </div>
                        <p className="text-gray-600">
                          Premium ingredients with no unnecessary fillers or
                          harmful additives
                        </p>
                      </div>

                      <div className="bg-[#F47C20]/5 p-6 rounded-xl border border-[#F47C20]/20">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-[#F47C20] text-white flex items-center justify-center flex-shrink-0 mr-4">
                            <Shield className="h-6 w-6" />
                          </div>
                          <h3 className="text-xl font-bold text-[#2C3E50]">
                            Lab Tested
                          </h3>
                        </div>
                        <p className="text-gray-600">
                          Every batch is tested for purity and potency to ensure
                          maximum results
                        </p>
                      </div>

                      <div className="bg-[#F47C20]/5 p-6 rounded-xl border border-[#F47C20]/20">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-full bg-[#F47C20] text-white flex items-center justify-center flex-shrink-0 mr-4">
                            <Award className="h-6 w-6" />
                          </div>
                          <h3 className="text-xl font-bold text-[#2C3E50]">
                            Expert Formulated
                          </h3>
                        </div>
                        <p className="text-gray-600">
                          Developed by fitness experts to maximize your
                          performance and results
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {product.directions && (
                  <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-2xl font-bold mb-4 text-[#2C3E50]">
                      Directions for Use
                    </h3>
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {product.directions}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && <ReviewSection product={product} />}

            {activeTab === "shipping" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-bold text-xl mb-6 text-[#2C3E50]">
                    Shipping Information
                  </h3>
                  <ul className="space-y-4">
                    <li className="pb-4 border-b border-gray-200">
                      <p className="font-semibold mb-2 text-[#2C3E50]">
                        Delivery Time
                      </p>
                      <p className="text-gray-600">
                        3-5 business days (standard shipping)
                      </p>
                    </li>
                    <li className="pb-4 border-b border-gray-200">
                      <p className="font-semibold mb-2 text-[#2C3E50]">
                        Free Shipping
                      </p>
                      <p className="text-gray-600">
                        Free shipping on all orders above ₹999
                      </p>
                    </li>
                    <li className="pb-4 border-b border-gray-200">
                      <p className="font-semibold mb-2 text-[#2C3E50]">
                        Express Delivery
                      </p>
                      <p className="text-gray-600">
                        1-2 business days (₹199 extra)
                      </p>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-bold text-xl mb-6 text-[#2C3E50]">
                    Return Policy
                  </h3>
                  <ul className="space-y-4">
                    <li className="pb-4 border-b border-gray-200">
                      <p className="font-semibold mb-2 text-[#2C3E50]">
                        Return Window
                      </p>
                      <p className="text-gray-600">
                        30 days from the date of delivery
                      </p>
                    </li>
                    <li className="pb-4 border-b border-gray-200">
                      <p className="font-semibold mb-2 text-[#2C3E50]">
                        Condition
                      </p>
                      <p className="text-gray-600">
                        Product must be unused and in original packaging
                      </p>
                    </li>
                    <li className="pb-4 border-b border-gray-200">
                      <p className="font-semibold mb-2 text-[#2C3E50]">
                        Process
                      </p>
                      <p className="text-gray-600">
                        Initiate return from your account and we&apos;ll arrange
                        pickup
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-3xl font-bold mb-8 text-[#2C3E50] relative">
              <span className="bg-[#F47C20] h-1 w-16 absolute -bottom-2 left-0 rounded-full"></span>
              RELATED PRODUCTS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="bg-gray-50 rounded-xl overflow-hidden transition-all hover:shadow-lg border border-gray-200 group"
                >
                  <div className="relative h-64 w-full bg-white overflow-hidden">
                    <Image
                      src={product.image || "/product-placeholder.jpg"}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {product.hasSale && (
                      <span className="absolute top-3 left-3 bg-[#F47C20] text-white text-xs font-bold px-3 py-1 rounded-full">
                        SALE
                      </span>
                    )}
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

                    <h3 className="font-bold mb-3 line-clamp-2 hover:text-[#F47C20] transition-colors text-center text-[#2C3E50]">
                      {product.name}
                    </h3>

                    <div className="text-center">
                      {product.hasSale ? (
                        <div className="flex items-center justify-center space-x-2">
                          <span className="font-bold text-[#F47C20] text-lg">
                            {formatCurrency(product.basePrice)}
                          </span>
                          <span className="text-gray-500 line-through text-sm">
                            {formatCurrency(product.regularPrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-[#2C3E50] text-lg">
                          {formatCurrency(product.basePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
