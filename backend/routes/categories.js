import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  cacheResponse,
  invalidateCacheOnSuccess,
} from "../middleware/cache.js";

const router = express.Router();

router.get("/", cacheResponse("categories", 300), getCategories);
router.post(
  "/",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["categories", "products"]),
  createCategory,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["categories", "products"]),
  updateCategory,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["categories", "products"]),
  deleteCategory,
);

export default router;
