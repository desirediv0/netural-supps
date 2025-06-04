"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchApi, formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  Eye,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  CreditCard,
  Building,
  Wallet,
  Smartphone,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  RotateCcw,
  Search,
  Filter,
} from "lucide-react";

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  // Handle page from URL
  const page = searchParams.get("page")
    ? Number.parseInt(searchParams.get("page"))
    : 1;

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;

      setLoadingOrders(true);
      setError("");

      try {
        const response = await fetchApi(
          `/payment/orders?page=${page}&limit=10`,
          {
            credentials: "include",
          }
        );

        setOrders(response.data.orders || []);
        setPagination(
          response.data.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0,
          }
        );
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setError("Failed to load your orders. Please try again later.");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, page]);

  // Get status badge color and icon
  const getStatusInfo = (status) => {
    const statusMap = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
        bgColor: "bg-yellow-50",
      },
      PROCESSING: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Package,
        bgColor: "bg-blue-50",
      },
      SHIPPED: {
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        icon: Truck,
        bgColor: "bg-indigo-50",
      },
      DELIVERED: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
        bgColor: "bg-green-50",
      },
      CANCELLED: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
        bgColor: "bg-red-50",
      },
      REFUNDED: {
        color: "bg-purple-100 text-purple-800 border-purple-200",
        icon: RotateCcw,
        bgColor: "bg-purple-50",
      },
    };
    return (
      statusMap[status] || {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: Package,
        bgColor: "bg-gray-50",
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

  // Handle pagination
  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    router.push(`/account/orders?page=${newPage}`);
  };

  // Filter orders by search term
  const filteredOrders = orders.filter((order) =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        variants={itemVariants}
      >
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                My Orders
              </h1>
              <p className="text-gray-500">
                Track and manage your order history
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative flex-1 md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {filterOpen && (
            <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select className="w-full border border-gray-200 rounded-lg p-2">
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select className="w-full border border-gray-200 rounded-lg p-2">
                    <option value="">All Time</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 3 Months</option>
                    <option value="180">Last 6 Months</option>
                    <option value="365">Last Year</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select className="w-full border border-gray-200 rounded-lg p-2">
                    <option value="date_desc">Date (Newest First)</option>
                    <option value="date_asc">Date (Oldest First)</option>
                    <option value="total_desc">Amount (High to Low)</option>
                    <option value="total_asc">Amount (Low to High)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-3">
                <Button
                  variant="outline"
                  className="border-gray-200"
                  onClick={() => setFilterOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {error && (
        <motion.div
          className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <XCircle className="h-5 w-5 mr-3 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {loadingOrders ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex justify-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-gray-200 border-t-yellow-500 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center"
          variants={itemVariants}
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">
            No Orders Found
          </h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You haven&apos;t placed any orders yet. Start shopping to see your
            orders here!
          </p>
          <Link href="/products">
            <Button className="bg-yellow-600 hover:bg-yellow-700 px-8 py-3 rounded-lg">
              Start Shopping
            </Button>
          </Link>
        </motion.div>
      ) : (
        <>
          {/* Order Cards */}
          <motion.div className="space-y-4" variants={containerVariants}>
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status);
              const StatusIcon = statusInfo.icon;
              const PaymentIcon = getPaymentIcon(order.paymentMethod);

              return (
                <motion.div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  variants={itemVariants}
                  onClick={() => router.push(`/account/orders/${order.id}`)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start mb-4 md:mb-0">
                        <div
                          className={`w-12 h-12 ${statusInfo.bgColor} rounded-xl flex items-center justify-center mr-4`}
                        >
                          <StatusIcon
                            className={`h-6 w-6 ${
                              statusInfo.color.includes("text")
                                ? statusInfo.color.split(" ")[1]
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-bold text-gray-800 mr-3">
                              Order #{order.orderNumber}
                            </h3>
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm mt-1">
                            Placed on {formatDate(order.date)}
                          </p>
                          <div className="flex items-center mt-2">
                            <PaymentIcon className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-600">
                              {order.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end">
                        <p className="text-xl font-bold text-gray-800 mb-1">
                          {formatCurrency(order.total)}
                        </p>
                        <p className="text-sm text-gray-500 mb-3">
                          {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </p>
                        <Button
                          className="bg-yellow-600 hover:bg-yellow-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/account/orders/${order.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <motion.div
              className="flex justify-center mt-8"
              variants={itemVariants}
            >
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0 rounded-lg border-gray-200"
                  onClick={() => changePage(1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0 rounded-lg border-gray-200"
                  onClick={() => changePage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page numbers */}
                <div className="flex space-x-2">
                  {[...Array(pagination.pages).keys()].map((i) => {
                    const pageNumber = i + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.pages ||
                      Math.abs(pageNumber - pagination.page) <= 1 ||
                      (pagination.page <= 2 && pageNumber <= 3) ||
                      (pagination.page >= pagination.pages - 1 &&
                        pageNumber >= pagination.pages - 2)
                    ) {
                      return (
                        <Button
                          key={pageNumber}
                          className={`w-10 h-10 p-0 rounded-lg ${
                            pagination.page === pageNumber
                              ? "bg-yellow-600 text-white hover:bg-yellow-700"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                          }`}
                          onClick={() => changePage(pageNumber)}
                        >
                          {pageNumber}
                        </Button>
                      );
                    } else if (
                      (pageNumber === 2 && pagination.page > 3) ||
                      (pageNumber === pagination.pages - 1 &&
                        pagination.page < pagination.pages - 2)
                    ) {
                      return (
                        <div
                          key={pageNumber}
                          className="w-10 h-10 flex items-center justify-center text-gray-500"
                        >
                          ...
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                <Button
                  variant="outline"
                  className="w-10 h-10 p-0 rounded-lg border-gray-200"
                  onClick={() => changePage(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  className="w-10 h-10 p-0 rounded-lg border-gray-200"
                  onClick={() => changePage(pagination.pages)}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
