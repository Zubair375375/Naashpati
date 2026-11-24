import express from "express";
import {
  createPromoCode,
  deletePromoCode,
  getPromoCodes,
  updatePromoCode,
  validatePromoCode,
} from "../controllers/promoCodeController.js";
import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/validate", validatePromoCode);
router.get("/validate", validatePromoCode);

router.get("/", protect, authorize("admin"), getPromoCodes);
router.post("/", protect, authorize("admin"), createPromoCode);
router.put("/:id", protect, authorize("admin"), updatePromoCode);
router.delete("/:id", protect, authorize("admin"), deletePromoCode);

export default router;
