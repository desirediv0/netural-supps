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

        // Set main image
        if (productData.images && productData.images.length > 0) {
          setMainImage(productData.images[0]);
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

          // Set default flavor and weight if available
          if (
            productData.flavorOptions &&
            productData.flavorOptions.length > 0
          ) {
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

  // Check if a combination is available
  const isCombinationAvailable = (flavorId, weightId) => {
    return availableCombinations.some(
      (combo) => combo.flavorId === flavorId && combo.weightId === weightId
    );
  };

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

  // Handle flavor change
  const handleFlavorChange = (flavor) => {
    setSelectedFlavor(flavor);

    // Find available weights for this flavor
    const availableWeightIds = getAvailableWeightsForFlavor(flavor.id);

    if (product?.weightOptions?.length > 0 && availableWeightIds.length > 0) {
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
        const firstAvailableWeight = product.weightOptions.find((weight) =>
          availableWeightIds.includes(weight.id)
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

    if (product?.flavorOptions?.length > 0 && availableFlavorIds.length > 0) {
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
        const firstAvailableFlavor = product.flavorOptions.find((flavor) =>
          availableFlavorIds.includes(flavor.id)
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

  // Check if product is in wishlist
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
    if (!selectedVariant) {
      // If no variant is selected but product has variants, use the first one
      if (product?.variants && product.variants.length > 0) {
        setIsAddingToCart(true);
        setCartSuccess(false);

        try {
          await addToCart(product.variants[0].id, quantity);
          setCartSuccess(true);

          // Clear success message after 3 seconds
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

      // Clear success message after 3 seconds
      setTimeout(() => {
        setCartSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Render product images - now supports variant images with improved fallback
  const renderImages = () => {
    let imagesToShow = [];

    // Priority 1: Selected variant images
    if (
      selectedVariant &&
      selectedVariant.images &&
      selectedVariant.images.length > 0
    ) {
      imagesToShow = selectedVariant.images;
    }
    // Priority 2: Product images
    else if (product && product.images && product.images.length > 0) {
      imagesToShow = product.images;
    }
    // Priority 3: Any variant images from any variant
    else if (product && product.variants && product.variants.length > 0) {
      const variantWithImages = product.variants.find(
        (variant) => variant.images && variant.images.length > 0
      );
      if (variantWithImages) {
        imagesToShow = variantWithImages.images;
      }
    }

    // If still no images available
    if (imagesToShow.length === 0) {
      return (
        <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src="/images/product-placeholder.jpg"
            alt={product?.name || "Product"}
            fill
            className="object-contain"
            priority
          />
        </div>
      );
    }

    // If there's only one image
    if (imagesToShow.length === 1) {
      return (
        <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={getImageUrl(imagesToShow[0].url)}
            alt={product?.name || "Product"}
            fill
            className="object-contain"
            priority
          />
        </div>
      );
    }

    // Find primary image or use first one
    const primaryImage =
      imagesToShow.find((img) => img.isPrimary) || imagesToShow[0];
    const currentMainImage =
      mainImage && imagesToShow.some((img) => img.url === mainImage.url)
        ? mainImage
        : primaryImage;

    // Main image display
    return (
      <div className="space-y-4">
        <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={getImageUrl(currentMainImage?.url)}
            alt={product?.name || "Product"}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Thumbnail grid for multiple images */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {imagesToShow.map((image, index) => (
            <div
              key={index}
              className={`relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 ${
                currentMainImage?.url === image.url
                  ? "border-primary"
                  : "border-transparent"
              }`}
              onClick={() => setMainImage(image)}
            >
              <Image
                src={getImageUrl(image.url)}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get image URL helper
  const getImageUrl = (image) => {
    if (!image) return "/images/product-placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `https://desirediv-storage.blr1.cdn.digitaloceanspaces.com/${image}`;
  };

  // Format price display
  const getPriceDisplay = () => {
    // Show loading state while initial data is being fetched
    if (initialLoading) {
      return (
        <div className="h-8 w-32 bg-gray-200 animate-pulse rounded-xl"></div>
      );
    }

    // If we have a selected variant, use its price
    if (selectedVariant) {
      if (selectedVariant.salePrice && selectedVariant.salePrice > 0) {
        return (
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-orange-600">
              {formatCurrency(selectedVariant.salePrice)}
            </span>
            <span className="text-xl text-gray-500 line-through">
              {formatCurrency(selectedVariant.price)}
            </span>
          </div>
        );
      }

      return (
        <span className="text-4xl font-bold text-gray-800">
          {formatCurrency(selectedVariant.price || 0)}
        </span>
      );
    }

    // Fallback to product base price if no variant is selected
    if (product) {
      if (product.hasSale && product.basePrice > 0) {
        return (
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-orange-600">
              {formatCurrency(product.basePrice)}
            </span>
            <span className="text-xl text-gray-500 line-through">
              {formatCurrency(product.regularPrice || 0)}
            </span>
          </div>
        );
      }

      return (
        <span className="text-4xl font-bold text-gray-800">
          {formatCurrency(product.basePrice || 0)}
        </span>
      );
    }

    return null;
  };

  // Handle add to wishlist
  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/products/${slug}`);
      return;
    }

    setIsAddingToWishlist(true);

    try {
      if (isInWishlist) {
        // Get wishlist to find the item ID
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
        // Add to wishlist
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

  // Display loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading product details...
          </p>
        </div>
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
        <div className="bg-red-50 p-8 rounded-2xl shadow-xl border border-red-200 flex flex-col items-center text-center max-w-md mx-auto">
          <AlertCircle className="text-red-500 h-16 w-16 mb-6" />
          <h2 className="text-2xl font-bold text-red-700 mb-4">
            Error Loading Product
          </h2>
          <p className="text-red-600 mb-8">{error}</p>
          <Link href="/products">
            <Button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
              <ChevronRight className="mr-2 h-5 w-5" /> Browse Other Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // If product not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
        <div className="bg-orange-50 p-8 rounded-2xl shadow-xl border border-orange-200 flex flex-col items-center text-center max-w-md mx-auto">
          <AlertCircle className="text-orange-500 h-16 w-16 mb-6" />
          <h2 className="text-2xl font-bold text-orange-700 mb-4">
            Product Not Found
          </h2>
          <p className="text-orange-600 mb-8">
            The product you are looking for does not exist or has been removed.
          </p>
          <Link href="/products">
            <Button className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
              <ChevronRight className="mr-2 h-5 w-5" /> Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Updated render code for the product image carousel
  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-br from-orange-50 via-white to-orange-50 min-h-screen">
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
        <Link
          href="/"
          className="text-gray-600 hover:text-orange-600 transition-colors"
        >
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
        <Link
          href="/products"
          className="text-gray-600 hover:text-orange-600 transition-colors"
        >
          Products
        </Link>
        {(product?.category || product?.categories?.[0]?.category) && (
          <>
            <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
            <Link
              href={`/category/${
                product.category?.slug || product.categories[0]?.category?.slug
              }`}
              className="text-gray-600 hover:text-orange-600 transition-colors"
            >
              {product.category?.name || product.categories[0]?.category?.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
        <span className="text-orange-600 font-semibold">{product?.name}</span>
      </div>

      {/* Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Product Images */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {loading ? (
            <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl animate-pulse"></div>
          ) : error ? (
            <div className="aspect-square w-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
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
        <div className="flex flex-col bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Brand name if available */}
          {product.brand && (
            <div className="text-orange-600 text-sm font-medium mb-2 bg-orange-50 px-3 py-1 rounded-full inline-block">
              {product.brand}
            </div>
          )}

          {/* Product name */}
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center mb-6">
            <div className="flex text-orange-400 mr-3">
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
          <div className="p-6 border border-gray-200 rounded-2xl mb-8 bg-gradient-to-r from-gray-50 to-white">
            <p className="text-gray-700 leading-relaxed">
              {product.shortDescription ||
                product.description?.substring(0, 150)}
              {product.description?.length > 150 &&
                !product.shortDescription &&
                "..."}
            </p>
          </div>

          {/* Flavor Selection for supplements */}
          {product.flavorOptions && product.flavorOptions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold mb-4 uppercase text-gray-800 tracking-wide">
                Flavor
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.flavorOptions.map((flavor) => {
                  // Check if this flavor has any available combinations
                  const availableWeightIds = getAvailableWeightsForFlavor(
                    flavor.id
                  );
                  const isAvailable = availableWeightIds.length > 0;

                  return (
                    <button
                      key={flavor.id}
                      className={`px-6 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                        selectedFlavor?.id === flavor.id
                          ? "border-orange-500 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                          : isAvailable
                          ? "border-gray-200 hover:border-orange-500 hover:text-orange-500 hover:bg-gray-50"
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
              <h3 className="text-sm font-semibold mb-4 uppercase text-gray-800 tracking-wide">
                Weight
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.weightOptions.map((weight) => {
                  // Check if this weight has any available combinations with the selected flavor
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
                      className={`px-6 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200 ${
                        selectedWeight?.id === weight.id
                          ? "border-orange-500 bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105"
                          : isAvailable
                          ? "border-gray-200 hover:border-orange-500 hover:text-orange-500 hover:bg-gray-50"
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
            <div className="mb-6 p-4 bg-green-50 text-green-600 text-sm rounded-2xl flex items-center border border-green-200 shadow-sm">
              <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              Item successfully added to your cart!
            </div>
          )}

          <div className="mb-6">
            {selectedVariant && selectedVariant.quantity > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-sm flex items-center shadow-sm">
                <CheckCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">In Stock</span>
                <span className="ml-2 text-green-600">
                  ({selectedVariant.quantity} available)
                </span>
              </div>
            )}
            {selectedVariant && selectedVariant.quantity === 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-center shadow-sm">
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="font-medium">Out of stock</span>
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold mb-4 uppercase text-gray-800 tracking-wide">
              Quantity
            </h3>
            <div className="flex items-center bg-gray-50 rounded-2xl p-1 w-fit">
              <button
                className="p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 disabled:hover:shadow-none"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || isAddingToCart}
              >
                <Minus className="h-5 w-5 text-gray-600" />
              </button>
              <span className="px-8 py-3 min-w-[4rem] text-center font-bold text-gray-800 text-lg">
                {quantity}
              </span>
              <button
                className="p-3 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-50 disabled:hover:shadow-none"
                onClick={() => handleQuantityChange(1)}
                disabled={
                  (selectedVariant &&
                    selectedVariant.quantity > 0 &&
                    quantity >= selectedVariant.quantity) ||
                  isAddingToCart
                }
              >
                <Plus className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              className="flex-1 flex items-center justify-center gap-3 py-6 text-base bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
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
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-6 w-6" />
                  Add to Cart
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className={`rounded-2xl py-6 border-2 transition-all duration-200 ${
                isInWishlist
                  ? "text-red-600 border-red-600 hover:bg-red-50 hover:shadow-lg"
                  : "border-gray-300 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 hover:shadow-lg"
              }`}
              size="icon"
              onClick={handleAddToWishlist}
              disabled={isAddingToWishlist}
            >
              <Heart
                className={`h-6 w-6 ${isInWishlist ? "fill-current" : ""}`}
              />
            </Button>
          </div>

          {/* Product Metadata */}
          <div className="border-t border-gray-200 pt-6 space-y-4 text-sm bg-gray-50 rounded-2xl p-6">
            {selectedVariant && selectedVariant.sku && (
              <div className="flex items-center">
                <span className="font-semibold w-32 text-gray-800">SKU:</span>
                <span className="text-gray-600 font-medium">
                  {selectedVariant.sku}
                </span>
              </div>
            )}

            {product.category && (
              <div className="flex items-center">
                <span className="font-semibold w-32 text-gray-800">
                  Category:
                </span>
                <Link
                  href={`/category/${product.category?.slug}`}
                  className="text-orange-600 hover:text-orange-700 font-medium hover:underline transition-colors"
                >
                  {product.category?.name}
                </Link>
              </div>
            )}

            {/* {product.tags && product.tags.length > 0 && (
              <div className="flex">
                <span className="font-medium w-32 text-gray-700">Tags:</span>
                <div className="text-gray-600">
                  {product.tags?.map((tag, index) => (
                    <span key={index}>
                      <Link
                        href={`/products?tag=${tag}`}
                        className="text-primary hover:underline"
                      >
                        {tag}
                      </Link>
                      {index < product.tags.length - 1 && ", "}
                    </span>
                  ))}
                </div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="mb-16 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex overflow-x-auto">
            <button
              className={`px-8 py-4 font-semibold text-sm uppercase transition-all duration-200 ${
                activeTab === "description"
                  ? "border-b-2 border-orange-500 text-orange-600 bg-white"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`px-8 py-4 font-semibold text-sm uppercase transition-all duration-200 ${
                activeTab === "reviews"
                  ? "border-b-2 border-orange-500 text-orange-600 bg-white"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({product.reviewCount || 0})
            </button>
            <button
              className={`px-8 py-4 font-semibold text-sm uppercase transition-all duration-200 ${
                activeTab === "shipping"
                  ? "border-b-2 border-orange-500 text-orange-600 bg-white"
                  : "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
              }`}
              onClick={() => setActiveTab("shipping")}
            >
              Shipping & Returns
            </button>
          </div>
        </div>

        <div className="py-8 px-8">
          {activeTab === "description" && (
            <div className="prose max-w-none">
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                  {product.description}
                </p>

                {product.isSupplement && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 mr-4 shadow-lg">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Pure Quality
                        </h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        Premium ingredients with no unnecessary fillers or
                        harmful additives
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 mr-4 shadow-lg">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Lab Tested
                        </h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        Every batch is tested for purity and potency to ensure
                        maximum results
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200 shadow-sm">
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center flex-shrink-0 mr-4 shadow-lg">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Expert Formulated
                        </h3>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        Developed by fitness experts to maximize your
                        performance and results
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {product.directions && (
                <div className="mt-8 p-8 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-2xl font-bold mb-6 text-orange-600">
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
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border border-orange-200 shadow-sm">
                <h3 className="font-bold text-2xl mb-6 text-gray-800">
                  Shipping Information
                </h3>
                <ul className="space-y-6">
                  <li className="pb-6 border-b border-orange-200">
                    <p className="font-semibold mb-2 text-gray-800">
                      Delivery Time
                    </p>
                    <p className="text-gray-700">
                      3-5 business days (standard shipping)
                    </p>
                  </li>
                  <li className="pb-6 border-b border-orange-200">
                    <p className="font-semibold mb-2 text-gray-800">
                      Free Shipping
                    </p>
                    <p className="text-gray-700">
                      Free shipping on all orders above ₹999
                    </p>
                  </li>
                  <li className="pb-6 border-b border-orange-200">
                    <p className="font-semibold mb-2 text-gray-800">
                      Express Delivery
                    </p>
                    <p className="text-gray-700">
                      1-2 business days (₹199 extra)
                    </p>
                  </li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="font-bold text-2xl mb-6 text-gray-800">
                  Return Policy
                </h3>
                <ul className="space-y-6">
                  <li className="pb-6 border-b border-gray-200">
                    <p className="font-semibold mb-2 text-gray-800">
                      Return Window
                    </p>
                    <p className="text-gray-700">
                      30 days from the date of delivery
                    </p>
                  </li>
                  <li className="pb-6 border-b border-gray-200">
                    <p className="font-semibold mb-2 text-gray-800">
                      Condition
                    </p>
                    <p className="text-gray-700">
                      Product must be unused and in original packaging
                    </p>
                  </li>
                  <li className="pb-6 border-b border-gray-200">
                    <p className="font-semibold mb-2 text-gray-800">Process</p>
                    <p className="text-gray-700">
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

      {/* Recently Viewed section would go here */}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-3xl font-bold mb-8 relative border-b border-gray-200 pb-4 text-gray-800">
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 w-16 absolute bottom-0 left-0 rounded-full"></span>
            RELATED PRODUCTS
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => {
              // Get image from lowest weight variant, or fallback
              const getRelatedProductImage = (product) => {
                if (product.variants && product.variants.length > 0) {
                  let selectedVariant = product.variants.reduce((min, v) => {
                    if (!v.weight || typeof v.weight.value !== "number")
                      return min;
                    if (
                      !min ||
                      (min.weight && v.weight.value < min.weight.value)
                    )
                      return v;
                    return min;
                  }, null);
                  if (!selectedVariant) selectedVariant = product.variants[0];
                  if (
                    selectedVariant.images &&
                    selectedVariant.images.length > 0
                  ) {
                    const primaryImg = selectedVariant.images.find(
                      (img) => img.isPrimary
                    );
                    if (primaryImg && primaryImg.url) return primaryImg.url;
                    if (selectedVariant.images[0].url)
                      return selectedVariant.images[0].url;
                  }
                }
                if (product.image) return product.image;
                return "/product-placeholder.jpg";
              };
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="bg-white rounded-2xl overflow-hidden transition-all hover:shadow-2xl border border-gray-100 group shadow-lg"
                >
                  <div className="relative h-64 w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <Image
                      src={getRelatedProductImage(product)}
                      alt={product.name}
                      fill
                      className="object-contain p-4 transition-transform group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    {product.hasSale && (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        SALE
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all"></div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <div className="flex text-orange-400">
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

                    <h3 className="font-bold mb-3 line-clamp-2 hover:text-orange-600 transition-colors text-gray-800">
                      {product.name}
                    </h3>

                    <div>
                      {product.hasSale ? (
                        <div className="flex items-center">
                          <span className="font-bold text-orange-600 text-lg">
                            {formatCurrency(product.basePrice)}
                          </span>
                          <span className="text-gray-500 line-through text-sm ml-2">
                            {formatCurrency(product.regularPrice)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-orange-600 text-lg">
                          {formatCurrency(product.basePrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
