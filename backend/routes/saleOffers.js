import express from "express";
import {
  getSaleOffers,
  getAllSaleOffers,
  getSaleOffer,
  createSaleOffer,
  deleteSaleOffer,
} from "../controllers/saleOfferController.js";
import { protect, authorize } from "../middleware/auth.js";
import {
  invalidateCacheOnSuccess,
} from "../middleware/cache.js";

const router = express.Router();

router.get("/", getSaleOffers);
router.get("/all", protect, authorize("admin"), getAllSaleOffers);
router.get("/:id", getSaleOffer);
router.post(
  "/",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["home", "products"]),
  createSaleOffer,
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  invalidateCacheOnSuccess(["home", "products"]),
  deleteSaleOffer,
);

export default router;
