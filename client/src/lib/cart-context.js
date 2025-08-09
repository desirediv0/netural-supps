"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { fetchApi } from "./utils";
import { useAuth } from "./auth-context";
import { toast } from "sonner";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart,
  mergeGuestCartWithUserCart,
  hasGuestCartItems,
  getGuestCartItemCount,
} from "./guest-cart-utils";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0,
    itemCount: 0,
    totalQuantity: 0,
  });
  const [loading, setLoading] = useState(false);
  const [cartItemsLoading, setCartItemsLoading] = useState({}); // Track loading state for individual items
  const [error, setError] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mergeProgress, setMergeProgress] = useState(null); // Track merge progress
  const mergeCompletedRef = useRef(false);

  // Set mounted state to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize cart based on authentication status
  useEffect(() => {
    if (!mounted) return;

    if (isAuthenticated) {
      // User is logged in, fetch their cart from server
      fetchCart();
    } else {
      // User is not logged in, load guest cart from localStorage
      setLoading(true);
      const guestCart = getGuestCart();
      setCart(guestCart);
      setLoading(false);
    }
  }, [isAuthenticated, mounted]);

  // Clear cart when user logs out
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      // Reset merge flag when user logs out
      mergeCompletedRef.current = false;
      // Don't clear cart for guest users - they should see their guest cart
      // Only clear if we have server cart data (authenticated user logged out)
      if (
        cart.items.length > 0 &&
        cart.items[0]?.id &&
        !cart.items[0]?.id.startsWith("guest_")
      ) {
        setCart({ items: [], subtotal: 0, itemCount: 0, totalQuantity: 0 });
        setCoupon(null);
      }
    }
  }, [isAuthenticated, mounted, cart.items]);

  // Merge guest cart when user logs in
  useEffect(() => {
    if (
      mounted &&
      isAuthenticated &&
      hasGuestCartItems() &&
      !mergeCompletedRef.current
    ) {
      mergeCompletedRef.current = true;
      setLoading(true); // Show loading during merge
      setMergeProgress("Merging your cart items...");

      // Reduced delay for faster merge process
      setTimeout(async () => {
        try {
          // First, fetch the current user cart to ensure we have the latest state
          setMergeProgress("Loading your existing cart...");
          await fetchCart();

          // Then merge guest cart items
          setMergeProgress("Adding guest items to your cart...");
          const result = await mergeGuestCartWithUserCart();
          if (result.success) {
            toast.success(result.message);
            // Fetch updated cart from server to show the merged result
            setMergeProgress("Updating cart display...");
            await fetchCart();
          } else {
            toast.error(result.message);
          }
        } catch (error) {
          console.error("Error merging cart:", error);
          toast.error("Failed to merge cart items");
          // Reset merge flag so user can try again
          mergeCompletedRef.current = false;
        } finally {
          setLoading(false); // Hide loading after merge
          setMergeProgress(null); // Clear progress message
        }
      }, 100); // Reduced to 100ms for even faster response
    }
  }, [isAuthenticated, mounted]);

  // Get cart from server (for authenticated users)
  const fetchCart = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const res = await fetchApi("/cart", {
        credentials: "include",
      });
      setCart(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
      // Set empty cart on error
      setCart({ items: [], subtotal: 0, itemCount: 0, totalQuantity: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Universal add to cart function
  const addToCart = async (productVariantId, quantity = 1) => {
    if (!mounted) return;

    setLoading(true);
    try {
      if (isAuthenticated) {
        // User is logged in, add to server cart
        const res = await fetchApi("/cart/add", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ productVariantId, quantity }),
        });

        // Update cart immediately to show updated counter in the UI
        await fetchCart();
        return res.data;
      } else {
        // User is not logged in, add to guest cart
        const updatedCart = await addToGuestCart(productVariantId, quantity);
        setCart(updatedCart);
        return updatedCart;
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || "Failed to add item to cart");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Universal update cart item function
  const updateCartItem = async (cartItemId, quantity) => {
    setCartItemsLoading((prev) => ({ ...prev, [cartItemId]: true }));
    try {
      if (isAuthenticated) {
        // User is logged in, update server cart
        const res = await fetchApi(`/cart/update/${cartItemId}`, {
          method: "PATCH",
          credentials: "include",
          body: JSON.stringify({ quantity }),
        });

        // Update cart locally to avoid full reload
        setCart((prevCart) => ({
          ...prevCart,
          items: prevCart.items.map((item) =>
            item.id === cartItemId
              ? {
                  ...item,
                  quantity,
                  subtotal: (parseFloat(item.price) * quantity).toFixed(2),
                }
              : item
          ),
          // Recalculate the cart totals
          subtotal: prevCart.items
            .reduce((sum, item) => {
              const itemPrice = parseFloat(item.price);
              const itemQuantity =
                item.id === cartItemId ? quantity : item.quantity;
              return sum + itemPrice * itemQuantity;
            }, 0)
            .toFixed(2),
          totalQuantity: prevCart.items.reduce((sum, item) => {
            return sum + (item.id === cartItemId ? quantity : item.quantity);
          }, 0),
        }));

        // Fetch the updated cart in the background to ensure consistency
        fetchCart();
        return res.data;
      } else {
        // User is not logged in, update guest cart
        const updatedCart = updateGuestCartItem(cartItemId, quantity);
        setCart(updatedCart);
        return updatedCart;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCartItemsLoading((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Universal remove from cart function
  const removeFromCart = async (cartItemId) => {
    setCartItemsLoading((prev) => ({ ...prev, [cartItemId]: true }));
    try {
      if (isAuthenticated) {
        // User is logged in, remove from server cart
        const res = await fetchApi(`/cart/remove/${cartItemId}`, {
          method: "DELETE",
          credentials: "include",
        });

        // Update cart locally to avoid full reload
        setCart((prevCart) => {
          const itemToRemove = prevCart.items.find(
            (item) => item.id === cartItemId
          );
          if (!itemToRemove) return prevCart;

          const itemQuantity = itemToRemove.quantity;
          const itemSubtotal = parseFloat(itemToRemove.subtotal);

          return {
            ...prevCart,
            items: prevCart.items.filter((item) => item.id !== cartItemId),
            itemCount: prevCart.itemCount - 1,
            totalQuantity: prevCart.totalQuantity - itemQuantity,
            subtotal: (parseFloat(prevCart.subtotal) - itemSubtotal).toFixed(2),
          };
        });

        // Fetch the updated cart in the background to ensure consistency
        fetchCart();
        return res.data;
      } else {
        // User is not logged in, remove from guest cart
        const updatedCart = removeFromGuestCart(cartItemId);
        setCart(updatedCart);
        return updatedCart;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCartItemsLoading((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Universal clear cart function
  const clearCart = async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // User is logged in, clear server cart
        const res = await fetchApi("/cart/clear", {
          method: "DELETE",
          credentials: "include",
        });
        setCart({ items: [], subtotal: 0, itemCount: 0, totalQuantity: 0 });
        setCoupon(null);
        return res.data;
      } else {
        // User is not logged in, clear guest cart
        const emptyCart = clearGuestCart();
        setCart(emptyCart);
        return emptyCart;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Apply coupon (only for authenticated users)
  const applyCoupon = async (code) => {
    if (!isAuthenticated) {
      toast.error("Please log in to apply coupons");
      return;
    }

    setCouponLoading(true);
    setError(null);
    try {
      // First verify if the coupon is valid with our cart total
      const cartTotal = parseFloat(cart.subtotal || 0).toFixed(2);

      try {
        console.log("Verifying coupon:", code, "with cart total:", cartTotal);

        const verifyResponse = await fetchApi("/coupons/verify", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ code, cartTotal }),
        });

        console.log("Verify response:", verifyResponse);

        // If we got here, coupon is valid - extract discount info
        const discountAmount = verifyResponse.data.coupon.discountAmount;
        const finalAmount = verifyResponse.data.coupon.finalAmount;
        const originalCartTotal = parseFloat(cartTotal);

        // Check if discount is capped (for fixed amount discounts)
        const discountPercentage = (discountAmount / originalCartTotal) * 100;
        const isDiscountCapped =
          verifyResponse.data.coupon.discountType === "FIXED_AMOUNT" &&
          discountPercentage >= 90;

        if (isDiscountCapped) {
          toast.info("The discount has been capped at 90% of your cart value", {
            duration: 5000,
          });
        }

        // Set coupon data right away for immediate UI update
        setCoupon({
          id: verifyResponse.data.coupon.id,
          code: verifyResponse.data.coupon.code,
          discountType: verifyResponse.data.coupon.discountType,
          discountValue: verifyResponse.data.coupon.discountValue,
          discountAmount,
          finalAmount,
          isDiscountCapped,
        });

        // Apply the coupon to the server in the background, but don't wait for it
        // This prevents full page reload while waiting for the server
        fetchApi("/coupons/apply", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ code }),
        }).catch((error) => {
          console.warn("Background coupon application error:", error);
          // If background apply fails, we don't need to show an error
          // since the coupon verification already succeeded
        });

        return verifyResponse.data;
      } catch (apiError) {
        console.error("API Error applying coupon:", apiError);
        // Extract error message from response or use a default message
        const errorMessage = apiError.message || "Failed to apply coupon";
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("Coupon error:", err);
      setError(err.message || "An error occurred while applying the coupon");
      throw err;
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = () => {
    setCoupon(null);
  };

  // Calculate totals
  const getCartTotals = () => {
    const subtotal = parseFloat(cart.subtotal || 0);
    const discount = coupon ? parseFloat(coupon.discountAmount || 0) : 0;
    const shipping = 0; // Free shipping
    const tax = 0; // No tax

    return {
      subtotal,
      discount,
      shipping,
      tax,
      total: subtotal - discount + shipping + tax,
    };
  };

  // Get cart item count for navbar display
  const getCartItemCount = () => {
    if (!mounted) return 0; // Return 0 during SSR to prevent hydration mismatch

    if (isAuthenticated) {
      return cart.totalQuantity || 0;
    } else {
      return getGuestCartItemCount();
    }
  };

  const value = {
    cart,
    loading,
    cartItemsLoading,
    error,
    coupon,
    couponLoading,
    mergeProgress,
    isAuthenticated,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartTotals,
    getCartItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
