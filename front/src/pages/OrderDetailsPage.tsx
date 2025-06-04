import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { orders } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  Package,
  CreditCard,
  MapPin,
  Clock,
  User,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, debugData } from "@/lib/utils";

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Define fetchOrderDetails outside of useEffect so it can be reused
  const fetchOrderDetails = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await orders.getOrderById(id);

      // Use the debug utility
      debugData("Order API Response", response, true);
      debugData("Order Data", response?.data?.data, true);

      if (response?.data?.success && response?.data?.data?.order) {
        // Fix: Access the order data correctly from response.data.data.order
        setOrderDetails(response.data.data.order);
      } else {
        setError(response?.data?.message || "Failed to fetch order details");
      }
    } catch (error: any) {
      console.error("Error fetching order details:", error);
      // More detailed error information
      if (error.response) {
        debugData("Error Response", error.response, true);
        setError(
          `API Error (${error.response.status}): ${error.response.data?.message || "Unknown error"}`
        );
      } else if (error.request) {
        debugData("Error Request", error.request, true);
        setError("Network error: No response received from server");
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-500";
      case "DELIVERED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-500";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-500";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-500";
    }
  };

  // Handle order status update
  const handleStatusUpdate = async (newStatus: string) => {
    if (!id) return;

    try {
      const response = await orders.updateOrderStatus(id, {
        status: newStatus,
      });

      if (response && response.data && response.data.success) {
        toast.success(`Order status updated to ${newStatus}`);

        // Update the order status in the UI
        setOrderDetails((prev: any) => ({
          ...prev,
          status: newStatus,
        }));
      } else {
        toast.error(response.data?.message || "Failed to update order status");
      }
    } catch (error: any) {
      console.error("Error updating order status:", error);
      toast.error(
        error.message || "An error occurred while updating the order status"
      );
    }
  };

  // Get image URL helper
  const getImageUrl = (image: string | undefined) => {
    if (!image) return "/images/product-placeholder.jpg";
    if (image.startsWith("http")) return image;
    return `https://desirediv-storage.blr1.digitaloceanspaces.com/${image}`;
  };

  // Loading state
  if (isLoading && !orderDetails) {
    return (
      <div className="flex h-full w-full items-center justify-center py-10">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-lg text-muted-foreground">
            Loading order details...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !orderDetails) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center py-10">
        <AlertTriangle className="h-16 w-16 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
        <p className="text-center text-muted-foreground">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetchOrderDetails();
          }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // No order or empty order data, but not in error state
  if (
    !isLoading &&
    !error &&
    (!orderDetails || Object.keys(orderDetails).length === 0)
  ) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" asChild className="mb-2">
          <Link to="/orders">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              No Order Data Available
            </h2>
            <p className="text-center text-muted-foreground mb-4">
              The order data could not be loaded or is empty. This could be due
              to:
            </p>
            <ul className="list-disc text-muted-foreground pl-6 mb-6">
              <li>The order ID {id} does not exist</li>
              <li>You don't have permission to view this order</li>
              <li>
                The API endpoint is not returning data in the expected format
              </li>
              <li>Server connectivity issues</li>
            </ul>
            <p className="text-sm text-muted-foreground mb-6">
              Check the browser console for more detailed debugging information.
            </p>
            <Button
              onClick={() => {
                setIsLoading(true);
                fetchOrderDetails();
              }}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fix access to order items (may need to adjust based on actual API response structure)
  const orderItems = orderDetails.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="outline" size="sm" asChild className="mb-2">
            <Link to="/orders">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            Order #{orderDetails.orderNumber}
          </h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(orderDetails.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(
              orderDetails.status
            )}`}
          >
            {orderDetails.status}
          </span>

          {/* Status update buttons */}
          {orderDetails.status !== "DELIVERED" &&
            orderDetails.status !== "CANCELLED" &&
            orderDetails.status !== "REFUNDED" && (
              <div className="flex flex-wrap gap-2">
                {/* Processing button - show for PENDING only */}
                {orderDetails.status === "PENDING" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("PROCESSING")}
                  >
                    Mark Processing
                  </Button>
                )}

                {/* Shipped button - show for PROCESSING, PAID */}
                {(orderDetails.status === "PROCESSING" ||
                  orderDetails.status === "PAID") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("SHIPPED")}
                  >
                    Mark Shipped
                  </Button>
                )}

                {/* Delivered button - show for SHIPPED */}
                {orderDetails.status === "SHIPPED" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("DELIVERED")}
                  >
                    Mark Delivered
                  </Button>
                )}

                {/* Paid button - show for PENDING, PROCESSING */}
                {(orderDetails.status === "PENDING" ||
                  orderDetails.status === "PROCESSING") && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("PAID")}
                  >
                    Mark Paid
                  </Button>
                )}

                {/* Cancel button - show for all except CANCELLED */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusUpdate("CANCELLED")}
                >
                  Cancel Order
                </Button>
              </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium">Product</th>
                      <th className="pb-2 text-left font-medium">Variant</th>
                      <th className="pb-2 text-right font-medium">Price</th>
                      <th className="pb-2 text-right font-medium">Quantity</th>
                      <th className="pb-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item: any) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-md bg-muted/50 overflow-hidden">
                              <img
                                src={getImageUrl(
                                  item.product?.images?.[0]?.url
                                )}
                                alt={item.product?.name || "Product"}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div>
                              <p className="font-medium">
                                {item.product?.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                SKU: {item.variant?.sku || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">
                          {item.variant?.flavor ? (
                            <div className="text-sm">
                              <span className="text-muted-foreground">
                                Flavor:{" "}
                              </span>
                              {item.variant.flavor.name}
                              {item.variant.weight && (
                                <>
                                  <br />
                                  <span className="text-muted-foreground">
                                    Weight:{" "}
                                  </span>
                                  {`${item.variant.weight.value}${item.variant.weight.unit}`}
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              N/A
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {formatCurrency(item.price)}
                        </td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right font-medium">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {orderDetails.user?.name || "Guest"}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {orderDetails.user?.email || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {orderDetails.user?.phone || "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Cancellation Information (if order is cancelled) */}
          {orderDetails.status === "CANCELLED" && (
            <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
              <CardHeader>
                <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Cancellation Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Cancelled At:</span>{" "}
                    {formatDate(orderDetails.cancelledAt)}
                  </p>
                  <p>
                    <span className="font-medium">Reason:</span>{" "}
                    {orderDetails.cancelReason || "No reason provided"}
                  </p>
                  <p>
                    <span className="font-medium">Cancelled By:</span>{" "}
                    {orderDetails.cancelledBy === orderDetails.userId
                      ? "Customer"
                      : "Admin"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Method:</span>{" "}
                  {orderDetails.razorpayPayment?.paymentMethod || "ONLINE"}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      orderDetails.razorpayPayment?.status === "CAPTURED" ||
                      orderDetails.razorpayPayment?.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {orderDetails.razorpayPayment?.status || "N/A"}
                  </span>
                </p>
                {orderDetails.razorpayPayment?.razorpayPaymentId && (
                  <p>
                    <span className="font-medium">Transaction ID:</span>{" "}
                    <span className="font-mono text-xs">
                      {orderDetails.razorpayPayment.razorpayPaymentId}
                    </span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orderDetails.shippingAddress ? (
                <div className="space-y-1">
                  <p className="font-medium">
                    {orderDetails.shippingAddress.name}
                  </p>
                  <p>{orderDetails.shippingAddress.street}</p>
                  <p>
                    {orderDetails.shippingAddress.city},{" "}
                    {orderDetails.shippingAddress.state}{" "}
                    {orderDetails.shippingAddress.postalCode}
                  </p>
                  <p>{orderDetails.shippingAddress.country}</p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {orderDetails.shippingAddress.phone || "N/A"}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No shipping address found
                </p>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(orderDetails.subTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (0%):</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>{formatCurrency(0)}</span>
                </div>
                {parseFloat(orderDetails.discount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(orderDetails.discount)}</span>
                  </div>
                )}
                {orderDetails.couponCode && (
                  <div className="mt-1 p-2 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 rounded-md">
                    <div className="flex items-center text-green-700 dark:text-green-500 font-medium mb-1">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Coupon applied: {orderDetails.couponCode}
                    </div>
                    {orderDetails.coupon && (
                      <div className="text-sm text-green-600 dark:text-green-500">
                        {orderDetails.coupon.discountType === "PERCENTAGE" ? (
                          <span>
                            {orderDetails.coupon.discountValue}% off the order
                            total
                          </span>
                        ) : (
                          <span>
                            {formatCurrency(orderDetails.coupon.discountValue)}{" "}
                            off the order total
                          </span>
                        )}
                        {orderDetails.coupon.description && (
                          <p className="text-xs mt-1 text-green-500 dark:text-green-400">
                            {orderDetails.coupon.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 font-medium">
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                      parseFloat(orderDetails.subTotal) -
                        parseFloat(orderDetails.discount || 0)
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Info */}
          {orderDetails.status === "SHIPPED" ||
          orderDetails.status === "DELIVERED" ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Tracking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orderDetails.tracking ? (
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Carrier:</span>{" "}
                      {orderDetails.tracking.carrier || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">Tracking Number:</span>{" "}
                      <span className="font-mono">
                        {orderDetails.tracking.trackingNumber ||
                          "Not available"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(
                          orderDetails.tracking?.status || orderDetails.status
                        )}`}
                      >
                        {orderDetails.tracking?.status || orderDetails.status}
                      </span>
                    </p>
                    {orderDetails.tracking.estimatedDelivery && (
                      <p>
                        <span className="font-medium">Estimated Delivery:</span>{" "}
                        {formatDate(orderDetails.tracking.estimatedDelivery)}
                      </p>
                    )}

                    {/* Tracking Updates */}
                    {orderDetails.tracking.updates &&
                      orderDetails.tracking.updates.length > 0 && (
                        <div className="mt-4">
                          <h4 className="mb-2 font-medium">Tracking Updates</h4>
                          <div className="space-y-3">
                            {orderDetails.tracking.updates.map(
                              (update: any, index: number) => (
                                <div
                                  key={index}
                                  className="rounded-md border border-muted bg-muted/40 p-3"
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {formatDate(update.timestamp)}
                                    </span>
                                  </div>
                                  <p className="mt-1 font-medium">
                                    {update.status}
                                  </p>
                                  {update.location && (
                                    <p className="text-sm text-muted-foreground">
                                      {update.location}
                                    </p>
                                  )}
                                  {update.description && (
                                    <p className="text-sm">
                                      {update.description}
                                    </p>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <Truck className="h-10 w-10 text-muted-foreground mb-2" />
                      <p className="font-medium">Shipping in progress</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {orderDetails.status === "DELIVERED"
                          ? "This order has been marked as delivered, but no detailed tracking information is available."
                          : "This order has been shipped, but detailed tracking information is not yet available."}
                      </p>
                      <p className="text-xs text-muted-foreground mt-4">
                        Status:{" "}
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(orderDetails.status)}`}
                        >
                          {orderDetails.status}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
