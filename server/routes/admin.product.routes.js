import express from "express";
import {
  getProducts,
  getProductById,
  getProductsByType,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  uploadVariantImage,
  deleteVariantImage,
  setVariantImageAsPrimary,
  reorderVariantImages,
  bulkVariantOperations,
  getFlavors,
  createFlavor,
  updateFlavor,
  deleteFlavor,
  getWeights,
  createWeight,
  updateWeight,
  deleteWeight,
} from "../controllers/admin.product.controller.js";
import {
  verifyAdminJWT,
  hasPermission,
} from "../middlewares/admin.middleware.js";
import { uploadFiles } from "../middlewares/multer.middlerware.js";

const router = express.Router();

// Product routes
router.get(
  "/products",
  verifyAdminJWT,
  hasPermission("products", "read"),
  getProducts
);

router.get(
  "/products/:productId",
  verifyAdminJWT,
  hasPermission("products", "read"),
  getProductById
);

// Get products by type (featured, bestseller, trending, new, etc.)
router.get(
  "/products/type/:productType",
  verifyAdminJWT,
  hasPermission("products", "read"),
  getProductsByType
);

router.post(
  "/products",
  verifyAdminJWT,
  hasPermission("products", "create"),
  uploadFiles.array("images"),
  createProduct
);

router.patch(
  "/products/:productId",
  verifyAdminJWT,
  hasPermission("products", "update"),
  uploadFiles.array("images"),
  updateProduct
);

router.delete(
  "/products/:productId",
  verifyAdminJWT,
  hasPermission("products", "delete"),
  deleteProduct
);

// Product image routes
router.post(
  "/products/:productId/images",
  verifyAdminJWT,
  hasPermission("products", "update"),
  uploadFiles.single("image"),
  uploadProductImage
);

router.delete(
  "/products/images/:imageId",
  verifyAdminJWT,
  hasPermission("products", "update"),
  deleteProductImage
);

// Product variant routes
router.post(
  "/products/:productId/variants",
  verifyAdminJWT,
  hasPermission("products", "update"),
  createProductVariant
);

// New bulk variant operations route
router.post(
  "/products/:productId/bulk-variants",
  verifyAdminJWT,
  hasPermission("products", "update"),
  bulkVariantOperations
);

router.patch(
  "/variants/:variantId",
  verifyAdminJWT,
  hasPermission("products", "update"),
  updateProductVariant
);

router.delete(
  "/variants/:variantId",
  verifyAdminJWT,
  hasPermission("products", "update"),
  deleteProductVariant
);

// Variant image routes
router.post(
  "/variants/:variantId/images",
  verifyAdminJWT,
  hasPermission("products", "update"),
  uploadFiles.single("image"),
  uploadVariantImage
);

router.delete(
  "/variants/images/:imageId",
  verifyAdminJWT,
  hasPermission("products", "update"),
  deleteVariantImage
);

router.patch(
  "/variants/images/:imageId/set-primary",
  verifyAdminJWT,
  hasPermission("products", "update"),
  setVariantImageAsPrimary
);

router.patch(
  "/variants/:variantId/images/reorder",
  verifyAdminJWT,
  hasPermission("products", "update"),
  reorderVariantImages
);

// Flavor routes
router.get(
  "/flavors",
  verifyAdminJWT,
  hasPermission("products", "read"),
  getFlavors
);

router.post(
  "/flavors",
  verifyAdminJWT,
  hasPermission("products", "create"),
  uploadFiles.single("image"),
  createFlavor
);

router.patch(
  "/flavors/:flavorId",
  verifyAdminJWT,
  hasPermission("products", "update"),
  uploadFiles.single("image"),
  updateFlavor
);

router.delete(
  "/flavors/:flavorId",
  verifyAdminJWT,
  hasPermission("products", "delete"),
  deleteFlavor
);

// Weight routes
router.get(
  "/weights",
  verifyAdminJWT,
  hasPermission("products", "read"),
  getWeights
);

router.post(
  "/weights",
  verifyAdminJWT,
  hasPermission("products", "create"),
  createWeight
);

router.patch(
  "/weights/:weightId",
  verifyAdminJWT,
  hasPermission("products", "update"),
  updateWeight
);

router.delete(
  "/weights/:weightId",
  verifyAdminJWT,
  hasPermission("products", "delete"),
  deleteWeight
);

export default router;
