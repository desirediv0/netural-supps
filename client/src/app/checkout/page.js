"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { fetchApi, formatCurrency, loadScript } from "@/lib/utils";
import { playSuccessSound, fireConfetti } from "@/lib/sound-utils";
import { Button } from "@/components/ui/button";
import {
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle,
  MapPin,
  Plus,
  IndianRupee,
  ShoppingBag,
  PartyPopper,
  Gift,
  Shield,
  Truck,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import AddressForm from "@/components/AddressForm";
import Image from "next/image";

export default function CheckoutPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { cart, coupon, getCartTotals, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("RAZORPAY");
  const [processing, setProcessing] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [razorpayKey, setRazorpayKey] = useState("");
  const [error, setError] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [confettiCannon, setConfettiCannon] = useState(false);

  const totals = getCartTotals();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=checkout");
    }
  }, [isAuthenticated, router]);

  // Redirect if cart is empty
  useEffect(() => {
    if (isAuthenticated && cart.items?.length === 0) {
      router.push("/cart");
    }
  }, [isAuthenticated, cart, router]);

  // Fetch addresses
  const fetchAddresses = async () => {
    if (!isAuthenticated) return;

    setLoadingAddresses(true);
    try {
      const response = await fetchApi("/users/addresses", {
        credentials: "include",
      });

      if (response.success) {
        setAddresses(response.data.addresses || []);

        if (response.data.addresses?.length > 0) {
          const defaultAddress = response.data.addresses.find(
            (addr) => addr.isDefault
          );
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else {
            setSelectedAddressId(response.data.addresses[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load your addresses");
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [isAuthenticated]);

  // Fetch Razorpay key
  useEffect(() => {
    const fetchRazorpayKey = async () => {
      try {
        const response = await fetchApi("/payment/razorpay-key", {
          credentials: "include",
        });
        if (response.success) {
          setRazorpayKey(response.data.key);
        }
      } catch (error) {
        console.error("Error fetching Razorpay key:", error);
      }
    };

    if (isAuthenticated) {
      fetchRazorpayKey();
    }
  }, [isAuthenticated]);

  const handleAddressSelect = (id) => {
    setSelectedAddressId(id);
  };

  const handlePaymentMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const handleAddressFormSuccess = () => {
    setShowAddressForm(false);
    fetchAddresses();
  };

  // Add countdown for redirect
  useEffect(() => {
    if (orderCreated && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (orderCreated && redirectCountdown === 0) {
      router.push(`/account/orders`);
    }
  }, [orderCreated, redirectCountdown, router]);

  // Enhanced confetti effect when order is successful
  useEffect(() => {
    if (successAnimation) {
      fireConfetti.celebration();

      const timer = setTimeout(() => {
        setConfettiCannon(true);
        fireConfetti.sides();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [successAnimation]);

  const handleSuccessfulPayment = (paymentResponse, orderData) => {
    setPaymentId(paymentResponse.razorpay_payment_id);
    setOrderCreated(true);
    setOrderNumber(orderData.orderNumber || "");

    setSuccessAnimation(true);
    playSuccessSound();
    clearCart();

    toast.success("Order placed successfully!", {
      duration: 4000,
      icon: <PartyPopper className="h-5 w-5 text-green-500" />,
      description: `Your order #${
        orderData.orderNumber || ""
      } has been confirmed.`,
    });
  };

  // Process checkout
  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const calculatedAmount = totals.subtotal - totals.discount;
      const amount = Math.max(
        Number.parseFloat(calculatedAmount.toFixed(2)),
        1
      );

      if (calculatedAmount < 1) {
        toast.info("Minimum order amount is ₹1. Your total has been adjusted.");
      }

      if (paymentMethod === "RAZORPAY") {
        const orderResponse = await fetchApi("/payment/checkout", {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            amount,
            currency: "INR",
            couponCode: coupon?.code || null,
            couponId: coupon?.id || null,
            discountAmount: totals.discount || 0,
          }),
        });

        if (!orderResponse.success) {
          throw new Error(orderResponse.message || "Failed to create order");
        }

        const razorpayOrder = orderResponse.data;
        setOrderId(razorpayOrder.id);

        const loaded = await loadScript(
          "https://checkout.razorpay.com/v1/checkout.js"
        );

        if (!loaded) {
          throw new Error("Razorpay SDK failed to load");
        }

        const options = {
          key: razorpayKey,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "Power Fitness - Premium Supplements for Your Fitness Journey",
          description: "Get high-quality supplements at the best prices.",
          order_id: razorpayOrder.id,
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          handler: async (response) => {
            try {
              const verificationResponse = await fetchApi("/payment/verify", {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  shippingAddressId: selectedAddressId,
                  billingAddressSameAsShipping: true,
                  couponCode: coupon?.code || null,
                  couponId: coupon?.id || null,
                  discountAmount: totals.discount || 0,
                  notes: "",
                }),
              });

              if (verificationResponse.success) {
                setOrderId(verificationResponse.data.orderId);
                handleSuccessfulPayment(response, verificationResponse.data);
              } else {
                throw new Error(
                  verificationResponse.message || "Payment verification failed"
                );
              }
            } catch (error) {
              console.error("Payment verification error:", error);

              if (
                error.message &&
                error.message.includes("previously cancelled")
              ) {
                setError(
                  "Your previous order was cancelled. Please refresh the page and try again."
                );
                toast.error("Please refresh the page to start a new checkout", {
                  duration: 6000,
                });
              } else {
                setError(error.message || "Payment verification failed");
              }
            }
          },
          theme: {
            color: "#F47C20",
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      console.error("Checkout error:", error);

      if (
        error.message &&
        error.message.includes("order was previously cancelled")
      ) {
        setError(
          "This order was previously cancelled. Please refresh the page to start a new checkout."
        );
        toast.error("Please refresh the page to start a new checkout", {
          duration: 6000,
        });
      } else {
        setError(error.message || "Checkout failed");
        toast.error(error.message || "Checkout failed");
      }
    } finally {
      setProcessing(false);
    }
  };

  if (!isAuthenticated || loadingAddresses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-10">
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // If order created successfully
  if (orderCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
            {/* Background pattern for festive feel */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-transparent z-0"></div>

            {/* Celebration animation */}
            <div className="relative z-10">
              <div className="relative flex justify-center">
                <div className="h-36 w-36 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <PartyPopper
                    className={`h-20 w-20 text-yellow-600 ${
                      confettiCannon ? "animate-pulse" : ""
                    }`}
                  />
                </div>

                {/* Radiating circles animation */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-ping absolute h-40 w-40 rounded-full bg-yellow-500 opacity-20"></div>
                  <div className="animate-ping absolute h-32 w-32 rounded-full bg-green-500 opacity-10 delay-150"></div>
                  <div className="animate-ping absolute h-24 w-24 rounded-full bg-yellow-500 opacity-10 delay-300"></div>
                </div>
              </div>

              <div className="text-center">
                <h1 className="text-4xl font-bold mb-2 text-gray-800 animate-pulse">
                  Woohoo!
                </h1>

                <h2 className="text-2xl font-bold mb-2 text-gray-800">
                  Order Confirmed!
                </h2>

                {orderNumber && (
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 py-3 px-6 rounded-full inline-block mb-4">
                    <p className="text-lg font-semibold text-yellow-700">
                      Order #{orderNumber}
                    </p>
                  </div>
                )}

                <div className="my-6 flex items-center justify-center bg-green-50 p-4 rounded-xl border border-green-200">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                  <p className="text-xl text-green-600 font-medium">
                    Payment Successful
                  </p>
                </div>

                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Thank you for your purchase! Your order has been successfully
                  placed and you&apos;ll receive an email confirmation shortly.
                </p>

                <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  <p className="text-blue-700">
                    Redirecting to orders page in {redirectCountdown} seconds...
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <Link href="/account/orders">
                    <Button className="gap-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 rounded-xl">
                      <ShoppingBag size={16} />
                      My Orders
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button
                      variant="outline"
                      className="gap-2 border-yellow-200 text-yellow-600 hover:bg-yellow-50 rounded-xl"
                    >
                      <Gift size={16} />
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Secure Checkout</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1 text-green-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center">
              <Truck className="h-4 w-4 mr-1 text-blue-500" />
              <span>Free Shipping</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start">
            <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-red-700 font-semibold">Payment Failed</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main checkout area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Addresses */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center text-gray-800">
                  <MapPin className="h-6 w-6 mr-3 text-yellow-500" />
                  Shipping Address
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-yellow-600 hover:bg-yellow-50 rounded-xl"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New
                </Button>
              </div>

              {showAddressForm && (
                <div className="mb-6">
                  <AddressForm
                    onSuccess={handleAddressFormSuccess}
                    onCancel={() => setShowAddressForm(false)}
                    isInline={true}
                  />
                </div>
              )}

              {addresses.length === 0 && !showAddressForm ? (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                  <span className="text-yellow-700">
                    You don&apos;t have any saved addresses.{" "}
                    <button
                      className="font-medium underline hover:text-yellow-800"
                      onClick={() => setShowAddressForm(true)}
                    >
                      Add an address
                    </button>{" "}
                    to continue.
                  </span>
                </div>
              ) : (
                <div
                  className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
                    showAddressForm ? "mt-6" : ""
                  }`}
                >
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                        selectedAddressId === address.id
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleAddressSelect(address.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800">
                          {address.name}
                        </span>
                        {address.isDefault && (
                          <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{address.street}</p>
                        <p>
                          {address.city}, {address.state} {address.postalCode}
                        </p>
                        <p>{address.country}</p>
                        <p className="mt-2">
                          Phone: {address.phone || "Not provided"}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center">
                        <input
                          type="radio"
                          name="addressSelection"
                          checked={selectedAddressId === address.id}
                          onChange={() => handleAddressSelect(address.id)}
                          className="h-4 w-4 text-yellow-500 border-gray-300 focus:ring-yellow-500"
                        />
                        <label className="ml-2 text-sm font-medium text-gray-700">
                          Ship to this address
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-xl font-bold flex items-center mb-6 text-gray-800">
                <CreditCard className="h-6 w-6 mr-3 text-yellow-500" />
                Payment Method
              </h2>

              <div className="space-y-4">
                <div
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    paymentMethod === "RAZORPAY"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handlePaymentMethodSelect("RAZORPAY")}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="razorpay"
                      name="paymentMethod"
                      checked={paymentMethod === "RAZORPAY"}
                      onChange={() => handlePaymentMethodSelect("RAZORPAY")}
                      className="h-4 w-4 text-yellow-500 border-gray-300 focus:ring-yellow-500"
                    />
                    <label
                      htmlFor="razorpay"
                      className="ml-3 flex items-center flex-1"
                    >
                      <span className="font-semibold text-gray-800">
                        Pay Online
                      </span>
                      <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                        Recommended
                      </span>
                    </label>
                    <span className="flex items-center">
                      <IndianRupee className="h-5 w-5 text-yellow-500" />
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-7">
                    Pay securely with Credit/Debit Card, UPI, NetBanking, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-6 text-gray-800">
                Order Summary
              </h2>

              <div className="divide-y divide-gray-100">
                <div className="pb-4">
                  <p className="text-sm font-semibold mb-3 text-gray-700">
                    {cart.totalQuantity} Items in Cart
                  </p>
                  <div className="max-h-52 overflow-y-auto space-y-3">
                    {cart.items?.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg flex-shrink-0 relative">
                          {item.product.image && (
                            <Image
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              fill
                              className="object-contain p-1"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-gray-800">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="font-semibold text-sm text-gray-800">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="py-4 space-y-3 text-sm">
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

                <div className="pt-4">
                  <div className="flex justify-between font-bold text-xl">
                    <span className="text-gray-800">Total</span>
                    <span className="text-yellow-600">
                      {formatCurrency(totals.subtotal - totals.discount)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6 h-14 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
                onClick={handleCheckout}
                disabled={
                  processing ||
                  !selectedAddressId ||
                  !paymentMethod ||
                  addresses.length === 0
                }
              >
                {processing ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Place Secure Order
                  </span>
                )}
              </Button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                By placing your order, you agree to our terms and conditions.
              </p>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Shield className="h-6 w-6 text-green-500 mb-1" />
                    <span className="text-xs text-gray-600">
                      Secure Payment
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Truck className="h-6 w-6 text-blue-500 mb-1" />
                    <span className="text-xs text-gray-600">Free Shipping</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Clock className="h-6 w-6 text-yellow-500 mb-1" />
                    <span className="text-xs text-gray-600">Fast Delivery</span>
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
