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
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAddVariantToCart } from "@/lib/cart-utils";

// Helper function to format image URLs correctly
const getImageUrl = (image) => {
  if (!image) return "/product-placeholder.jpg";
  if (image.startsWith("http")) return image;
  return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
};

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
  const { addVariantToCart } = useAddVariantToCart();
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
              getImageUrl(productData.images[0].url) ||
                getImageUrl(productData.image) ||
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
            } else if (
              productData.weightOptions?.length > 0 &&
              combinations.length > 0
            ) {
              // No flavors, but weights and variants exist
              const firstWeight = productData.weightOptions[0];
              setSelectedWeight(firstWeight);
              // Find the variant for this weight
              const matchingVariant = combinations.find(
                (combo) => combo.weightId === firstWeight.id
              );
              if (matchingVariant) {
                setSelectedVariant(matchingVariant.variant);
              }
            } else if (productData.variants.length > 0) {
              // Fallback: just pick the first variant
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

    if (productDetails?.flavorOptions?.length > 0) {
      // Find available flavors for this weight
      const availableFlavorIds = getAvailableFlavorsForWeight(weight.id);
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
      // No flavors, just pick the variant for this weight
      const matchingVariant = availableCombinations.find(
        (combo) => combo.weightId === weight.id
      );
      if (matchingVariant) {
        setSelectedVariant(matchingVariant.variant);
      }
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
      const result = await addVariantToCart(
        variantToAdd,
        quantity,
        productDetails?.name || product?.name
      );
      if (result.success) {
        setSuccess(true);
        // Auto close after success notification
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      } else {
        setError("Failed to add to cart. Please try again.");
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError("Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  // Get the appropriate image to display (variant image or product image)
  const getDisplayImage = () => {
    // Priority 1: Selected variant images
    if (
      selectedVariant &&
      selectedVariant.images &&
      selectedVariant.images.length > 0
    ) {
      const primaryImage = selectedVariant.images.find((img) => img.isPrimary);
      const imageUrl = primaryImage
        ? primaryImage.url
        : selectedVariant.images[0]?.url;

      return getImageUrl(imageUrl);
    }

    // Priority 2: Product images
    if (displayProduct?.images && displayProduct.images.length > 0) {
      const primaryImage = displayProduct.images.find((img) => img.isPrimary);
      const imageUrl = primaryImage
        ? primaryImage.url
        : displayProduct.images[0]?.url;

      return getImageUrl(imageUrl);
    }

    // Priority 3: Any variant images from any variant
    if (displayProduct?.variants && displayProduct.variants.length > 0) {
      const variantWithImages = displayProduct.variants.find(
        (variant) => variant.images && variant.images.length > 0
      );
      if (variantWithImages) {
        const primaryImage = variantWithImages.images.find(
          (img) => img.isPrimary
        );
        const imageUrl = primaryImage
          ? primaryImage.url
          : variantWithImages.images[0]?.url;

        return getImageUrl(imageUrl);
      }
    }

    // Priority 4: Check product.image property (from API response)
    if (displayProduct?.image) {
      return getImageUrl(displayProduct.image);
    }

    // Final fallback
    return imgSrc || "/placeholder.jpg";
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
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(selectedVariant.salePrice)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              {formatCurrency(selectedVariant.price)}
            </span>
          </div>
        );
      }
      return (
        <span className="text-2xl font-bold">
          {formatCurrency(selectedVariant.price || 0)}
        </span>
      );
    }

    // If no variant but product details available, show base price
    if (productDetails) {
      if (productDetails.hasSale && productDetails.basePrice > 0) {
        return (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(productDetails.basePrice)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              {formatCurrency(productDetails.regularPrice || 0)}
            </span>
          </div>
        );
      }
      return (
        <span className="text-2xl font-bold">
          {formatCurrency(productDetails.basePrice || 0)}
        </span>
      );
    }

    // Fallback to product from props if no details fetched yet
    if (product) {
      if (product.hasSale && product.basePrice > 0) {
        return (
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(product.basePrice)}
            </span>
            <span className="text-lg text-gray-500 line-through">
              {formatCurrency(product.regularPrice || 0)}
            </span>
          </div>
        );
      }
      return (
        <span className="text-2xl font-bold">
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{displayProduct.name}</DialogTitle>
        </DialogHeader>

        {loading && !productDetails ? (
          <div className="py-8 flex justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* Product Image */}
            <div className="relative h-72 md:h-full rounded-md overflow-hidden bg-gray-50 shadow-sm">
              <Image
                src={getDisplayImage()}
                alt={displayProduct.name}
                fill
                className="object-contain p-2"
                sizes="(max-width: 768px) 100vw, 400px"
                onError={() => setImgSrc("/product-placeholder.jpg")}
              />
              {displayProduct.hasSale && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  SALE
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-50 text-green-600 text-sm rounded flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Item added to cart successfully
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}

              {/* Price */}
              <div className="mb-4">{getPriceDisplay()}</div>

              {/* Rating */}
              {displayProduct.avgRating > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(displayProduct.avgRating || 0)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 ml-2">
                    ({displayProduct.reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {displayProduct.description || "No description available"}
              </p>

              {/* Flavor selection */}
              {productDetails?.flavorOptions &&
                productDetails.flavorOptions.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Flavor
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
                            className={`px-3 py-2 rounded-md border text-sm transition-all ${
                              selectedFlavor?.id === flavor.id
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : isAvailable
                                ? "border-gray-300 hover:border-gray-400"
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
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight
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
                            className={`px-3 py-2 rounded-md border text-sm transition-all ${
                              selectedWeight?.id === weight.id
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : isAvailable
                                ? "border-gray-300 hover:border-gray-400"
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
                <div className="mb-4">
                  <span
                    className={`text-sm ${
                      selectedVariant.quantity > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedVariant.quantity > 0
                      ? `In Stock (${selectedVariant.quantity} available)`
                      : "Out of Stock"}
                  </span>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2.5 rounded-l border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    disabled={quantity <= 1 || loading}
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-6 py-2.5 border-t border-b border-gray-300 bg-white min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2.5 rounded-r border border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
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

              {/* Actions */}
              <div className="flex space-x-2 mt-auto">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 py-6"
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
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>

                <Link
                  href={`/products/${displayProduct.slug}`}
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full py-6">
                    View Details
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
