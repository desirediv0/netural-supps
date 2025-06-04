"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { fetchApi } from "./utils";
import { useAuth } from "./auth-context";
import { toast } from "sonner";

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

  // Fetch cart on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCart({ items: [], subtotal: 0, itemCount: 0, totalQuantity: 0 });
      setCoupon(null);
    }
  }, [isAuthenticated]);

  // Get cart
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetchApi("/cart", {
        credentials: "include",
      });
      setCart(res.data);
      return res.data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add to cart
  const addToCart = async (productVariantId, quantity = 1) => {
    setLoading(true);
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        // User is not logged in, redirect to login page
        if (typeof window !== "undefined") {
          // Create a URL with the return path
          const returnUrl = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?returnUrl=${returnUrl}`;

          // Show toast notification
          toast.info("Please log in to add items to your cart");
        }
        setLoading(false);
        return;
      }

      const res = await fetchApi("/cart/add", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ productVariantId, quantity }),
      });

      // Update cart immediately to show updated counter in the UI
      const updatedCart = await fetchCart();

      // Provide visual feedback (could be improved with toast notification)
      if (typeof window !== "undefined") {
        // Make cart icon pulse briefly
        const cartIcon = document.querySelector(".cart-icon");
        if (cartIcon) {
          cartIcon.classList.add("animate-pulse");
          setTimeout(() => {
            cartIcon.classList.remove("animate-pulse");
          }, 1000);
        }

        // Show success toast
        toast.success("Item added to cart");
      }

      return res.data;
    } catch (err) {
      setError(err.message);

      // Show error toast
      if (typeof window !== "undefined") {
        toast.error(err.message || "Failed to add item to cart");
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item
  const updateCartItem = async (cartItemId, quantity) => {
    // Set loading state for specific cart item
    setCartItemsLoading((prev) => ({ ...prev, [cartItemId]: true }));
    try {
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
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCartItemsLoading((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Remove from cart
  const removeFromCart = async (cartItemId) => {
    setCartItemsLoading((prev) => ({ ...prev, [cartItemId]: true }));
    try {
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
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setCartItemsLoading((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Clear cart
  const clearCart = async () => {
    setLoading(true);
    try {
      const res = await fetchApi("/cart/clear", {
        method: "DELETE",
        credentials: "include",
      });
      setCart({ items: [], subtotal: 0, itemCount: 0, totalQuantity: 0 });
      setCoupon(null);
      return res.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Apply coupon
  const applyCoupon = async (code) => {
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

  const value = {
    cart,
    loading,
    cartItemsLoading,
    error,
    coupon,
    couponLoading,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartTotals,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
