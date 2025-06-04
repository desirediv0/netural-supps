"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchApi, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Star,
  Minus,
  Plus,
  ShoppingCart,
  CheckCircle,
  AlertCircle,
  Heart,
  Share2,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";

export default function ProductQuickView({ product, open, onOpenChange }) {
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addToCart } = useCart();
  const [productDetails, setProductDetails] = useState(null);
  const [imgSrc, setImgSrc] = useState("");
  const [availableCombinations, setAvailableCombinations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Reset states when product changes or dialog closes
  useEffect(() => {
    if (!open) {
      // Reset everything when dialog closes
      setSelectedFlavor(null);
      setSelectedWeight(null);
      setSelectedVariant(null);
      setQuantity(1);
      setError(null);
      setSuccess(false);
      setProductDetails(null);
      setImgSrc("");
      setAvailableCombinations([]);
      setInitialLoading(true);
      return;
    }

    if (product) {
      // Set initial image when product changes
      setImgSrc(product.image || "/product-placeholder.jpg");
    }
  }, [product, open]);

  // Fetch product details when product changes
  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!product || !open) return;

      setLoading(true);
      setInitialLoading(true);
      try {
        // Fetch detailed product info
        const response = await fetchApi(`/public/products/${product.slug}`);
        if (response.data && response.data.product) {
          const productData = response.data.product;
          setProductDetails(productData);

          // Update image if available
          if (productData.images && productData.images.length > 0) {
            setImgSrc(
              productData.images[0].url ||
                productData.image ||
                "/product-placeholder.jpg"
            );
          }

          // Extract all available combinations from variants
          if (productData.variants && productData.variants.length > 0) {
            const combinations = productData.variants
              .filter((v) => v.isActive && v.quantity > 0)
              .map((variant) => ({
                flavorId: variant.flavorId,
                weightId: variant.weightId,
                variant: variant,
              }));

            setAvailableCombinations(combinations);

            // Set default selections
            if (productData.flavorOptions?.length > 0) {
              const firstFlavor = productData.flavorOptions[0];
              setSelectedFlavor(firstFlavor);

              // Find matching weights for this flavor
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
              // If no flavor/weight options but variants exist, use the first variant
              setSelectedVariant(productData.variants[0]);
            }
          }
        } else {
          setError("Product details not available");
        }
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchProductDetails();
  }, [product, open]);

  // Get available weights for a specific flavor
  const getAvailableWeightsForFlavor = (flavorId) => {
    const availableWeights = availableCombinations
      .filter((combo) => combo.flavorId === flavorId)
      .map((combo) => combo.weightId);

    return availableWeights;
  };

  // Get available flavors for a specific weight
  const getAvailableFlavorsForWeight = (weightId) => {
    const availableFlavors = availableCombinations
      .filter((combo) => combo.weightId === weightId)
      .map((combo) => combo.flavorId);

    return availableFlavors;
  };

  // Check if a combination is available
  const isCombinationAvailable = (flavorId, weightId) => {
    return availableCombinations.some(
      (combo) => combo.flavorId === flavorId && combo.weightId === weightId
    );
  };

  // Handle flavor change
  const handleFlavorChange = (flavor) => {
    setSelectedFlavor(flavor);

    // Find available weights for this flavor
    const availableWeightIds = getAvailableWeightsForFlavor(flavor.id);

    if (
      productDetails?.weightOptions?.length > 0 &&
      availableWeightIds.length > 0
    ) {
      // Use currently selected weight if it's compatible with the new flavor
      if (selectedWeight && availableWeightIds.includes(selectedWeight.id)) {
        // Current weight is compatible, keep it selected
        const matchingVariant = availableCombinations.find(
          (combo) =>
            combo.flavorId === flavor.id && combo.weightId === selectedWeight.id
        );

        if (matchingVariant) {
          setSelectedVariant(matchingVariant.variant);
        }
      } else {
        // Current weight is not compatible, switch to first available
        const firstAvailableWeight = productDetails.weightOptions.find(
          (weight) => availableWeightIds.includes(weight.id)
        );

        if (firstAvailableWeight) {
          setSelectedWeight(firstAvailableWeight);

          // Find the corresponding variant
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

  // Handle weight change
  const handleWeightChange = (weight) => {
    setSelectedWeight(weight);

    // Find available flavors for this weight
    const availableFlavorIds = getAvailableFlavorsForWeight(weight.id);

    if (
      productDetails?.flavorOptions?.length > 0 &&
      availableFlavorIds.length > 0
    ) {
      // Use currently selected flavor if it's compatible with the new weight
      if (selectedFlavor && availableFlavorIds.includes(selectedFlavor.id)) {
        // Current flavor is compatible, keep it selected
        const matchingVariant = availableCombinations.find(
          (combo) =>
            combo.weightId === weight.id && combo.flavorId === selectedFlavor.id
        );

        if (matchingVariant) {
          setSelectedVariant(matchingVariant.variant);
        }
      } else {
        // Current flavor is not compatible, switch to first available
        const firstAvailableFlavor = productDetails.flavorOptions.find(
          (flavor) => availableFlavorIds.includes(flavor.id)
        );

        if (firstAvailableFlavor) {
          setSelectedFlavor(firstAvailableFlavor);

          // Find the corresponding variant
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

  // Handle quantity change
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

  // Handle add to cart
  const handleAddToCart = async () => {
    setAddingToCart(true);
    setError(null);
    setSuccess(false);

    // If no variant is selected but product has variants, use the first one
    let variantToAdd = selectedVariant;

    if (!variantToAdd && productDetails?.variants?.length > 0) {
      variantToAdd = productDetails.variants[0];
    }

    if (!variantToAdd) {
      setError("No product variant available");
      setAddingToCart(false);
      return;
    }

    try {
      await addToCart(variantToAdd.id, quantity);
      setSuccess(true);

      // Auto close after success notification
      setTimeout(() => {
        onOpenChange(false);
      }, 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Format price display
  const getPriceDisplay = () => {
    // Show loading state while initial data is being fetched
    if (initialLoading || loading) {
      return <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>;
    }

    // If we have a selected variant, show its price
    if (selectedVariant) {
      if (selectedVariant.salePrice && selectedVariant.salePrice > 0) {
        return (
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#F47C20]">
              {formatCurrency(selectedVariant.salePrice)}
            </span>
            <span className="text-xl text-gray-500 line-through">
              {formatCurrency(selectedVariant.price)}
            </span>
          </div>
        );
      }
      return (
        <span className="text-3xl font-bold text-[#2C3E50]">
          {formatCurrency(selectedVariant.price || 0)}
        </span>
      );
    }

    // If no variant but product details available, show base price
    if (productDetails) {
      if (productDetails.hasSale && productDetails.basePrice > 0) {
        return (
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#F47C20]">
              {formatCurrency(productDetails.basePrice)}
            </span>
            <span className="text-xl text-gray-500 line-through">
              {formatCurrency(productDetails.regularPrice || 0)}
            </span>
          </div>
        );
      }
      return (
        <span className="text-3xl font-bold text-[#2C3E50]">
          {formatCurrency(productDetails.basePrice || 0)}
        </span>
      );
    }

    // Fallback to product from props if no details fetched yet
    if (product) {
      if (product.hasSale && product.basePrice > 0) {
        return (
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-[#F47C20]">
              {formatCurrency(product.basePrice)}
            </span>
            <span className="text-xl text-gray-500 line-through">
              {formatCurrency(product.regularPrice || 0)}
            </span>
          </div>
        );
      }
      return (
        <span className="text-3xl font-bold text-[#2C3E50]">
          {formatCurrency(product.basePrice || 0)}
        </span>
      );
    }

    return null;
  };

  if (!product) return null;

  // Use the detailed product info if available, otherwise fall back to the basic product
  const displayProduct = productDetails || product;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0 bg-white">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-[#2C3E50] pr-8">
              {displayProduct.name}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 hover:bg-gray-100 rounded-full"
              >
                <Heart className="h-5 w-5 text-gray-600" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 hover:bg-gray-100 rounded-full"
              >
                <Share2 className="h-5 w-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {loading && !productDetails ? (
          <div className="py-16 flex justify-center">
            <div className="w-12 h-12 border-4 border-[#F47C20] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] rounded-xl overflow-hidden bg-gray-50 shadow-sm">
                <Image
                  src={imgSrc || "/placeholder.svg"}
                  alt={displayProduct.name}
                  fill
                  className="object-contain p-6"
                  sizes="(max-width: 768px) 100vw, 450px"
                  onError={() => setImgSrc("/product-placeholder.jpg")}
                />
                {displayProduct.hasSale && (
                  <div className="absolute top-4 left-4 bg-[#F47C20] text-white text-sm font-bold px-3 py-2 rounded-lg shadow-lg">
                    SALE
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col space-y-6">
              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">
                    Item added to cart successfully!
                  </span>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Price */}
              <div className="border-b border-gray-100 pb-4">
                {getPriceDisplay()}
              </div>

              {/* Rating */}
              {displayProduct.avgRating > 0 && (
                <div className="flex items-center space-x-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.round(displayProduct.avgRating || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {displayProduct.avgRating?.toFixed(1)} (
                    {displayProduct.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* Flavor selection */}
              {productDetails?.flavorOptions &&
                productDetails.flavorOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                      Choose Flavor
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productDetails.flavorOptions.map((flavor) => {
                        const availableWeightIds = getAvailableWeightsForFlavor(
                          flavor.id
                        );
                        const isAvailable = availableWeightIds.length > 0;

                        return (
                          <button
                            key={flavor.id}
                            type="button"
                            onClick={() => handleFlavorChange(flavor)}
                            disabled={!isAvailable}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              selectedFlavor?.id === flavor.id
                                ? "border-[#F47C20] bg-[#F47C20] text-white shadow-md"
                                : isAvailable
                                ? "border-gray-300 hover:border-[#F47C20] hover:text-[#F47C20]"
                                : "border-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {flavor.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Weight selection */}
              {productDetails?.weightOptions &&
                productDetails.weightOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                      Choose Weight
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {productDetails.weightOptions.map((weight) => {
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
                            type="button"
                            onClick={() => handleWeightChange(weight)}
                            disabled={!isAvailable}
                            className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              selectedWeight?.id === weight.id
                                ? "border-[#F47C20] bg-[#F47C20] text-white shadow-md"
                                : isAvailable
                                ? "border-gray-300 hover:border-[#F47C20] hover:text-[#F47C20]"
                                : "border-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {weight.value} {weight.unit}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Stock Availability */}
              {selectedVariant && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <span
                    className={`text-sm font-medium ${
                      selectedVariant.quantity > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedVariant.quantity > 0
                      ? `✓ In Stock (${selectedVariant.quantity} available)`
                      : "✗ Out of Stock"}
                  </span>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-[#2C3E50] mb-3">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={quantity <= 1 || loading}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-6 py-3 bg-white font-semibold text-[#2C3E50] min-w-[4rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-3 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        loading ||
                        (selectedVariant &&
                          selectedVariant.quantity > 0 &&
                          quantity >= selectedVariant.quantity)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-[#F47C20] hover:bg-[#E06A1A] text-white font-semibold text-lg rounded-lg shadow-lg hover:shadow-xl transition-all"
                  disabled={
                    loading ||
                    addingToCart ||
                    (!selectedVariant &&
                      (!productDetails?.variants ||
                        productDetails.variants.length === 0)) ||
                    (selectedVariant && selectedVariant.quantity < 1)
                  }
                >
                  {addingToCart ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      Adding to Cart...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-3" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Link
                  href={`/products/${displayProduct.slug}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    className="w-full py-4 border-2 border-[#2C3E50] text-[#2C3E50] hover:bg-[#2C3E50] hover:text-white font-semibold text-lg rounded-lg transition-all"
                  >
                    View Full Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
