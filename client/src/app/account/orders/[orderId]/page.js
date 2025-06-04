"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClientOnly } from "@/components/client-only";
import { fetchApi, formatCurrency, formatDate } from "@/lib/utils";
import Image from "next/image";
import {
  ArrowLeft,
  Package,
  FileX,
  X,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RotateCcw,
  Tag,
  CreditCard,
  Building,
  Wallet,
  Smartphone,
  Calendar,
  DollarSign,
  MapPin,
  User,
  AlertTriangle,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function OrderDetailsPage({ params }) {
  const { orderId } = params;
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [showTrackingDetails, setShowTrackingDetails] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    items: true,
    payment: true,
    shipping: true,
    tracking: true,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch order details
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!isAuthenticated || !orderId) return;

      setLoadingOrder(true);
      setError("");

      try {
        const response = await fetchApi(`/payment/orders/${orderId}`, {
          credentials: "include",
        });

        setOrder(response.data);
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        setError("Failed to load order details. Please try again later.");
      } finally {
        setLoadingOrder(false);
      }
    };

    fetchOrderDetails();
  }, [isAuthenticated, orderId]);

  // Handle cancel order
  const handleCancelOrder = async (e) => {
    e.preventDefault();

    if (!cancelReason.trim()) {
      setError("Please provide a reason for cancellation");
      return;
    }

    setCancelling(true);
    setError("");

    try {
      await fetchApi(`/payment/orders/${orderId}/cancel`, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ reason: cancelReason }),
      });

      // Refresh order data
      const response = await fetchApi(`/payment/orders/${orderId}`, {
        credentials: "include",
      });

      setOrder(response.data);
      setShowCancelForm(false);
      setCancelReason("");
    } catch (error) {
      console.error("Failed to cancel order:", error);
      setError(
        error.message || "Failed to cancel order. Please try again later."
      );
    } finally {
      setCancelling(false);
    }
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Get status info with colors and icons
  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: {
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
        dotColor: "bg-amber-400",
        progressColor: "bg-amber-400",
      },
      PROCESSING: {
        color: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Package,
        dotColor: "bg-blue-400",
        progressColor: "bg-blue-400",
      },
      SHIPPED: {
        color: "bg-purple-50 text-purple-700 border-purple-200",
        icon: Truck,
        dotColor: "bg-purple-400",
        progressColor: "bg-purple-400",
      },
      DELIVERED: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle,
        dotColor: "bg-emerald-400",
        progressColor: "bg-emerald-400",
      },
      CANCELLED: {
        color: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
        dotColor: "bg-red-400",
        progressColor: "bg-red-400",
      },
      REFUNDED: {
        color: "bg-violet-50 text-violet-700 border-violet-200",
        icon: RotateCcw,
        dotColor: "bg-violet-400",
        progressColor: "bg-violet-400",
      },
    };
    return (
      statusMap[status] || {
        color: "bg-gray-50 text-gray-700 border-gray-200",
        icon: Package,
        dotColor: "bg-gray-400",
        progressColor: "bg-gray-400",
      }
    );
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    const methodIcons = {
      CARD: CreditCard,
      NETBANKING: Building,
      WALLET: Wallet,
      UPI: Smartphone,
      EMI: Calendar,
      OTHER: DollarSign,
    };
    return methodIcons[method] || DollarSign;
  };

  // Check if order can be cancelled
  const canCancel = order && ["PENDING", "PROCESSING"].includes(order.status);

  // Get progress percentage based on status
  const getProgressPercentage = (status) => {
    const progressMap = {
      PENDING: 25,
      PROCESSING: 50,
      SHIPPED: 75,
      DELIVERED: 100,
      CANCELLED: 0,
      REFUNDED: 0,
    };
    return progressMap[status] || 0;
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-yellow-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-white shadow-lg"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-yellow-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              href="/account/orders"
              className="inline-flex items-center text-sm text-gray-600 hover:text-yellow-600 mb-2 font-medium transition-colors group"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Orders
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Order Details
            </h1>
          </div>

          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <Download className="h-4 w-4 mr-2" />
              Invoice
            </Button>

            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            {canCancel && !showCancelForm && (
              <Button
                onClick={() => setShowCancelForm(true)}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center animate-in slide-in-from-top-2">
            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loadingOrder ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex justify-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-yellow-500 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
        ) : !order ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FileX className="h-12 w-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Order Not Found
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have
              permission to view it.
            </p>
            <Link href="/account/orders">
              <Button className="bg-yellow-600 hover:bg-yellow-700 px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all">
                View All Orders
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Order Status Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-2">
                        <h2 className="text-xl font-bold text-gray-900 mr-3">
                          Order #{order.orderNumber}
                        </h2>
                        {(() => {
                          const statusInfo = getStatusInfo(order.status);
                          const StatusIcon = statusInfo.icon;
                          return (
                            <span
                              className={`px-3 py-1 inline-flex items-center text-sm font-medium rounded-full border ${statusInfo.color}`}
                            >
                              <StatusIcon className="h-4 w-4 mr-2" />
                              {order.status}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-gray-500">
                        Placed on {formatDate(order.date)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>Order Progress</span>
                      <span>{getProgressPercentage(order.status)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          getStatusInfo(order.status).progressColor
                        }`}
                        style={{
                          width: `${getProgressPercentage(order.status)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Cancel Form */}
                  {showCancelForm && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                      <h3 className="font-bold text-red-800 mb-4 flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Cancel Order
                      </h3>
                      <p className="text-sm text-red-700 mb-4">
                        Please provide a reason for cancellation. This will help
                        us improve our service.
                      </p>
                      <form onSubmit={handleCancelOrder}>
                        <div className="mb-4">
                          <label
                            htmlFor="cancelReason"
                            className="block text-sm font-semibold text-red-700 mb-2"
                          >
                            Reason for cancellation
                          </label>
                          <textarea
                            id="cancelReason"
                            className="w-full border border-red-300 rounded-lg px-4 py-3 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                            required
                            placeholder="Please explain why you want to cancel this order..."
                          ></textarea>
                        </div>
                        <div className="flex space-x-4">
                          <Button
                            type="submit"
                            disabled={cancelling}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {cancelling ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Cancelling...
                              </>
                            ) : (
                              "Cancel Order"
                            )}
                          </Button>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowCancelForm(false);
                              setCancelReason("");
                            }}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Never Mind
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Cancellation Info */}
                  {order.status === "CANCELLED" && order.cancelReason && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
                      <div className="flex items-center mb-3">
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                        <h3 className="font-bold text-red-800">
                          Order Cancelled
                        </h3>
                      </div>
                      <p className="text-sm text-red-700 mb-2">
                        <span className="font-semibold">Reason:</span>{" "}
                        {order.cancelReason}
                      </p>
                      {order.cancelledAt && (
                        <p className="text-sm text-red-700">
                          <span className="font-semibold">Cancelled on:</span>{" "}
                          {formatDate(order.cancelledAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div
                  className="p-6 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection("items")}
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Package className="h-5 w-5 mr-3 text-yellow-500" />
                    Order Items ({order.items.length})
                  </h3>
                  {expandedSections.items ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {expandedSections.items && (
                  <div className="p-6">
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center p-4 border border-gray-100 rounded-xl hover:border-yellow-200 hover:shadow-sm transition-all"
                        >
                          <Link
                            href={`/products/${item.slug}`}
                            className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden mr-4"
                          >
                            {item.image ? (
                              <Image
                                width={64}
                                height={64}
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {item.name}
                            </h4>
                            <div className="text-sm text-gray-500 mb-2">
                              {(item.flavor || item.weight) && (
                                <p>
                                  {item.flavor && (
                                    <span>Flavor: {item.flavor}</span>
                                  )}
                                  {item.flavor && item.weight && (
                                    <span> • </span>
                                  )}
                                  {item.weight && (
                                    <span>Weight: {item.weight}</span>
                                  )}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">
                                  {formatCurrency(item.price)}
                                </span>{" "}
                                × {item.quantity}
                              </div>
                              <div className="font-semibold text-gray-900">
                                {formatCurrency(item.subtotal)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tracking Information */}
              {order.tracking && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div
                    className="p-6 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSection("tracking")}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Truck className="h-5 w-5 mr-3 text-blue-500" />
                      Tracking Information
                    </h3>
                    {expandedSections.tracking ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  {expandedSections.tracking && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <span className="text-sm text-blue-600 font-medium">
                            Carrier
                          </span>
                          <p className="font-semibold text-blue-900">
                            {order.tracking.carrier}
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <span className="text-sm text-blue-600 font-medium">
                            Tracking Number
                          </span>
                          <p className="font-mono font-semibold text-blue-900">
                            {order.tracking.trackingNumber}
                          </p>
                        </div>
                        {order.tracking.estimatedDelivery && (
                          <div className="bg-blue-50 rounded-lg p-4 md:col-span-2">
                            <span className="text-sm text-blue-600 font-medium">
                              Estimated Delivery
                            </span>
                            <p className="font-semibold text-blue-900">
                              {formatDate(order.tracking.estimatedDelivery)}
                            </p>
                          </div>
                        )}
                      </div>

                      {order.tracking.updates &&
                        order.tracking.updates.length > 0 && (
                          <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-4">
                              Tracking Updates
                            </h4>
                            <div className="space-y-4">
                              {order.tracking.updates.map((update, index) => (
                                <div key={index} className="flex items-start">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900">
                                      {update.status}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {formatDate(update.timestamp)}{" "}
                                      {update.location &&
                                        `• ${update.location}`}
                                    </p>
                                    {update.description && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {update.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div
                  className="p-6 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection("payment")}
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order Summary
                  </h3>
                  {expandedSections.payment ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {expandedSections.payment && (
                  <div className="p-6">
                    <div className="space-y-3 text-sm mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(order.subTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping:</span>
                        <span className="text-emerald-600 font-medium">
                          FREE
                        </span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount:</span>
                          <span className="font-medium">
                            -{formatCurrency(order.discount)}
                          </span>
                        </div>
                      )}
                      {order.couponCode && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3">
                          <div className="flex items-center text-emerald-700 text-sm font-medium mb-1">
                            <Tag className="h-4 w-4 mr-2" />
                            Coupon: {order.couponCode}
                          </div>
                          {order.couponDetails && (
                            <div className="text-xs text-emerald-600">
                              {order.couponDetails.discountType ===
                              "PERCENTAGE" ? (
                                <span>
                                  {order.couponDetails.discountValue}% off
                                </span>
                              ) : (
                                <span>
                                  {formatCurrency(
                                    order.couponDetails.discountValue
                                  )}{" "}
                                  off
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span className="text-yellow-600">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-sm font-bold mb-4 text-gray-900 flex items-center">
                        <CreditCard className="h-4 w-4 mr-2 text-yellow-500" />
                        Payment Information
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Method:</span>
                          <div className="flex items-center">
                            {(() => {
                              const PaymentIcon = getPaymentIcon(
                                order.paymentMethod
                              );
                              return (
                                <PaymentIcon className="h-4 w-4 mr-2 text-gray-500" />
                              );
                            })()}
                            <span className="font-medium">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          {(() => {
                            const statusInfo = getStatusInfo(
                              order.paymentStatus
                            );
                            const StatusIcon = statusInfo.icon;
                            return (
                              <span
                                className={`px-2 py-1 inline-flex items-center text-xs font-medium rounded-lg border ${statusInfo.color}`}
                              >
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {order.paymentStatus}
                              </span>
                            );
                          })()}
                        </div>
                        {order.paymentId && (
                          <div>
                            <span className="text-gray-600">Payment ID:</span>
                            <p className="font-mono text-xs mt-1 break-all bg-gray-50 p-2 rounded">
                              {order.paymentId}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div
                  className="p-6 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSection("shipping")}
                >
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-3 text-green-500" />
                    Shipping Address
                  </h3>
                  {expandedSections.shipping ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>

                {expandedSections.shipping && (
                  <div className="p-6">
                    {order.shippingAddress ? (
                      <div className="space-y-2">
                        <div className="flex items-center mb-3">
                          <User className="h-4 w-4 text-yellow-500 mr-2" />
                          <p className="font-semibold text-gray-900">
                            {order.shippingAddress.name || ""}
                          </p>
                        </div>
                        <p className="text-gray-700">
                          {order.shippingAddress.street}
                        </p>
                        <p className="text-gray-700">
                          {order.shippingAddress.city},{" "}
                          {order.shippingAddress.state}{" "}
                          {order.shippingAddress.postalCode}
                        </p>
                        <p className="text-gray-700">
                          {order.shippingAddress.country}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">
                          No shipping address available
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Notes */}
              {order.notes && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order Notes
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {order.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
}
