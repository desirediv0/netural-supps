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
} from "../controllers/product.controller.js";
import { trackProductView } from "../middlewares/tracking.middleware.js";

const router = express.Router();

// Categories
router.get("/categories", getAllCategories);
router.get("/categories/:slug/products", getProductsByCategory);

// Products
router.get("/products", getAllProducts);
router.get("/products/max-price", getMaxPrice);
router.get("/products/:slug", trackProductView, getProductBySlug);
router.get("/product-variant", getProductVariant);

// Flavors and Weights
router.get("/flavors", getAllFlavors);
router.get("/weights", getAllWeights);

export default router;
