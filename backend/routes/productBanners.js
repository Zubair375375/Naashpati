import express from "express";
import {
  getProductBanners,
  getAllProductBanners,
  createProductBanner,
  deleteProductBanner,
} from "../controllers/productBannerController.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  cacheResponse,
  invalidateCacheOnSuccess,
} from "../middleware/cache.js";

const router = express.Router();

router.get("/", cacheResponse("banners", 300), getProductBanners);
router.get("/all", protect, authorize("admin"), getAllProductBanners);
router.post(
  "/",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["banners", "home"]),
  createProductBanner,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["banners", "home"]),
  deleteProductBanner,
);

export default router;
