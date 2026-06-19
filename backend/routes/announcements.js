import express from "express";
import {
  getActiveAnnouncements,
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  cacheResponse,
  invalidateCacheOnSuccess,
} from "../middleware/cache.js";

const router = express.Router();

router.get("/", cacheResponse("home", 300), getActiveAnnouncements);
router.get("/all", protect, authorize("admin"), getAllAnnouncements);
router.post(
  "/",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["home"]),
  createAnnouncement,
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["home"]),
  updateAnnouncement,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["home"]),
  deleteAnnouncement,
);

export default router;
