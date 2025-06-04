"use client";

import React, { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  AlertCircle,
  Loader2,
  Tag,
  Gift,
  ArrowRight,
  Heart,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const CartItem = React.memo(
  ({ item, onUpdateQuantity, onRemove, isLoading }) => {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 flex items-center space-x-4">
            <div className="relative h-20 w-20 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={item.product.image || "/placeholder.svg"}
                alt={item.product.name}
                fill
                className="object-contain p-2"
              />
            </div>
            <div className="flex-1">
              <Link
                href={`/products/${item.product.slug}`}
                className="font-semibold text-gray-800 hover:text-yellow-600 transition-colors line-clamp-2"
              >
                {item.product.name}
              </Link>
              <div className="text-sm text-gray-500 mt-1 flex items-center space-x-2">
                <span>{item.variant.flavor?.name}</span>
                <span>•</span>
                <span>
                  {item.variant.weight?.value}
                  {item.variant.weight?.unit}
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center justify-between md:justify-center">
            <span className="md:hidden text-sm font-medium text-gray-600">
              Price:
            </span>
            <span className="font-semibold text-gray-800">
              {formatCurrency(item.price)}
            </span>
          </div>

          <div className="md:col-span-2 flex items-center justify-between md:justify-center">
            <span className="md:hidden text-sm font-medium text-gray-600">
              Quantity:
            </span>
            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity, -1)}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 rounded-l-lg transition-colors"
                disabled={isLoading || item.quantity <= 1}
              >
                <Minus className="h-4 w-4 text-gray-600" />
              </button>
              <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin inline" />
                ) : (
                  item.quantity
                )}
              </span>
              <button
                onClick={() => onUpdateQuantity(item.id, item.quantity, 1)}
                className="p-2 hover:bg-gray-100 disabled:opacity-50 rounded-r-lg transition-colors"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center justify-between md:justify-center">
            <div className="flex items-center md:block">
              <span className="md:hidden mr-2 text-sm font-medium text-gray-600">
                Subtotal:
              </span>
              <span className="font-bold text-lg text-gray-800">
                {formatCurrency(item.subtotal)}
              </span>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg ml-4 disabled:opacity-50 transition-all"
              aria-label="Remove item"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Trash2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);
CartItem.displayName = "CartItem";

export default function CartPage() {
  const {
    cart,
    loading,
    cartItemsLoading,
    error,
    removeFromCart,
    updateCartItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    coupon,
    couponLoading,
    getCartTotals,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const router = useRouter();

  const handleQuantityChange = useCallback(
    async (cartItemId, currentQuantity, change) => {
      const newQuantity = currentQuantity + change;
      if (newQuantity < 1) return;

      try {
        await updateCartItem(cartItemId, newQuantity);
        toast.success("Cart updated successfully");
      } catch (err) {
        console.error("Error updating quantity:", err);
        toast.error("Failed to update cart");
      }
    },
    [updateCartItem]
  );

  const handleRemoveItem = useCallback(
    async (cartItemId) => {
      try {
        await removeFromCart(cartItemId);
        toast.success("Item removed from cart");
      } catch (err) {
        console.error("Error removing item:", err);
        toast.error("Failed to remove item");
      }
    },
    [removeFromCart]
  );

  const handleClearCart = useCallback(async () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      try {
        await clearCart();
        toast.success("Cart has been cleared");
      } catch (err) {
        console.error("Error clearing cart:", err);
        toast.error("Failed to clear cart");
      }
    }
  }, [clearCart]);

  const handleApplyCoupon = useCallback(
    async (e) => {
      e.preventDefault();

      if (!couponCode.trim()) {
        setCouponError("Please enter a coupon code");
        return;
      }

      setCouponError("");

      try {
        const response = await applyCoupon(couponCode);
        setCouponCode("");
        toast.success("Coupon applied successfully");
      } catch (err) {
        setCouponError(err.message || "Invalid coupon code");
        toast.error(err.message || "Invalid coupon code");
      }
    },
    [couponCode, applyCoupon]
  );

  const handleRemoveCoupon = useCallback(() => {
    removeCoupon();
    setCouponCode("");
    setCouponError("");
    toast.success("Coupon removed");
  }, [removeCoupon]);

  const totals = useMemo(() => getCartTotals(), [getCartTotals, cart, coupon]);

  const handleCheckout = useCallback(() => {
    const calculatedAmount = totals.subtotal - totals.discount;
    if (calculatedAmount < 1) {
      toast.info("Minimum order amount is ₹1");
      return;
    }

    if (!isAuthenticated) {
      router.push("/login?redirect=checkout");
    } else {
      router.push("/checkout");
    }
  }, [isAuthenticated, router, totals]);

  if (loading && !cart.items.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h1>
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if ((!cart.items || cart.items.length === 0) && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h1>
          <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-gray-100 max-w-md mx-auto">
            <div className="inline-flex justify-center items-center bg-yellow-100 p-6 rounded-full mb-6">
              <ShoppingBag className="h-12 w-12 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-gray-800">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven&apos;t added any products to your cart yet.
            </p>
            <Link href="/products">
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Your Cart</h1>
          <div className="text-sm text-gray-600">
            {cart.items?.length} {cart.items?.length === 1 ? "item" : "items"}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start mb-6">
            <AlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-semibold text-red-700">Cart Error</h2>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Desktop Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 bg-white rounded-xl border border-gray-100 font-semibold text-gray-700">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Subtotal</div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleQuantityChange}
                  onRemove={handleRemoveItem}
                  isLoading={cartItemsLoading[item.id]}
                />
              ))}
            </div>

            {/* Cart Actions */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <Link href="/products">
                <Button
                  variant="outline"
                  className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 px-6 py-3 rounded-xl font-semibold"
                >
                  Continue Shopping
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={handleClearCart}
                className="text-red-500 border-red-200 hover:bg-red-50 px-6 py-3 rounded-xl font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Cart Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Order Summary
              </h2>

              {/* Apply Coupon */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 flex items-center text-gray-700">
                  <Tag className="h-4 w-4 mr-2 text-yellow-500" />
                  Have a coupon?
                </h3>
                {coupon ? (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-green-700 text-lg">
                          {coupon.code}
                        </span>
                        <p className="text-sm text-green-600 mt-1">
                          {coupon.discountType === "PERCENTAGE"
                            ? `${coupon.discountValue}% off`
                            : `₹${coupon.discountValue} off`}
                        </p>
                        {((Number.parseFloat(coupon.discountValue) > 90 &&
                          coupon.discountType === "PERCENTAGE") ||
                          coupon.isDiscountCapped) && (
                          <p className="text-xs text-amber-600 mt-1">
                            *Maximum discount capped at 90%
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                        disabled={couponLoading}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <form
                      onSubmit={handleApplyCoupon}
                      className="flex space-x-2"
                    >
                      <Input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className={`flex-1 h-12 px-4 border-2 rounded-xl transition-colors ${
                          couponError
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-yellow-500"
                        }`}
                      />
                      <Button
                        type="submit"
                        disabled={couponLoading}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 rounded-xl"
                      >
                        {couponLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </form>
                    <p className="text-xs text-gray-500 mt-2">
                      *Maximum discount limited to 90% of cart value
                    </p>
                    {couponError && (
                      <div className="mt-2 flex items-start gap-1.5 text-red-600">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p className="text-xs">{couponError}</p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Price Details */}
              <div className="border-t border-gray-100 pt-6">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      {formatCurrency(totals.subtotal)}
                    </span>
                  </div>

                  {coupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">
                        -{formatCurrency(totals.discount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-green-600 font-semibold flex items-center">
                      <Gift className="h-4 w-4 mr-1" />
                      FREE
                    </span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-xl mt-6 pt-6 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-yellow-600">
                    {formatCurrency(totals.subtotal - totals.discount)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full mt-6 h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                onClick={handleCheckout}
              >
                <span className="flex items-center justify-center">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              </Button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Taxes and shipping calculated at checkout
              </p>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Heart className="h-3 w-3 mr-1 text-red-500" />
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center">
                    <Gift className="h-3 w-3 mr-1 text-green-500" />
                    <span>Free Shipping</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
