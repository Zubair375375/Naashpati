import express from "express";
import {
  getHeroBadges,
  updateHeroBadges,
  updateHeroGenderImages,
} from "../controllers/heroBadgeController.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  cacheResponse,
  invalidateCacheOnSuccess,
} from "../middleware/cache.js";

const router = express.Router();

router.get("/", cacheResponse("home", 300), getHeroBadges);
router.put(
  "/",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["home"]),
  updateHeroBadges,
);
router.put(
  "/gender-images",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["home"]),
  updateHeroGenderImages,
);

export default router;
