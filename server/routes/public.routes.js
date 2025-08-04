import express from "express";
import {
  getAllCategories,
  getProductsByCategory,
} from "../controllers/category.controller.js";
import {
  getAllProducts,
  getProductBySlug,
  getProductVariant,
  getAllFlavors,
  getAllWeights,
  getMaxPrice,
  getProductsByType,
} from "../controllers/product.controller.js";
import { trackProductView } from "../middlewares/tracking.middleware.js";
import {
  getBrandsByTag,
  getBrandBySlug,
} from "../controllers/public.controller.js";

const router = express.Router();

// Categories
router.get("/categories", getAllCategories);
router.get("/categories/:slug/products", getProductsByCategory);

// Products
router.get("/products", getAllProducts);
router.get("/products/max-price", getMaxPrice);
router.get("/products/type/:productType", getProductsByType);
router.get("/products/:slug", trackProductView, getProductBySlug);
router.get("/product-variant", getProductVariant);

// Flavors and Weights
router.get("/flavors", getAllFlavors);
router.get("/weights", getAllWeights);

// Brands
router.get("/brands-by-tag", getBrandsByTag);
router.get("/brand/:slug", getBrandBySlug);

export default router;
