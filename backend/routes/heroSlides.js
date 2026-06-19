import express from "express";
import {
  getHeroSlides,
  getAllHeroSlides,
  createHeroSlide,
  deleteHeroSlide,
} from "../controllers/heroSlideController.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  cacheResponse,
  invalidateCacheOnSuccess,
} from "../middleware/cache.js";

const router = express.Router();

router.get("/", cacheResponse("home", 300), getHeroSlides);
router.get("/all", protect, authorize("admin"), getAllHeroSlides);
router.post(
  "/",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["home"]),
  createHeroSlide,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["home"]),
  deleteHeroSlide,
);

export default router;
