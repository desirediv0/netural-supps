import express from "express";
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  updateTracking,
  createOrder,
  processPayment,
  getOrderStats,
} from "../controllers/admin.order.controller.js";
import {
  verifyAdminJWT,
  hasPermission,
} from "../middlewares/admin.middleware.js";

const router = express.Router();

// Order routes
router.get(
  "/orders",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  getOrders
);

router.get(
  "/orders/:orderId",
  verifyAdminJWT,
  hasPermission("orders", "read"),
  getOrderById
);

router.patch(
  "/orders/:orderId/status",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  updateOrderStatus
);

router.patch(
  "/orders/:orderId/tracking",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  updateTracking
);

router.post(
  "/orders",
  verifyAdminJWT,
  hasPermission("orders", "create"),
  createOrder
);

router.post(
  "/orders/:orderId/process-payment",
  verifyAdminJWT,
  hasPermission("orders", "update"),
  processPayment
);

// Order statistics
router.get(
  "/orders-stats",
  verifyAdminJWT,
  hasPermission("dashboard", "read"),
  getOrderStats
);

export default router;
