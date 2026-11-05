import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  getCustomerAnalyticsOverview,
  getCustomerAnalyticsCAC,
  getCustomerAnalyticsLTV,
  getCustomerAnalyticsCustomers,
  getCustomerAnalyticsChannels,
  getCustomerAnalyticsRatio,
  getCustomerAnalyticsCohorts,
  getCustomerAnalyticsTrends,
} from "../controllers/customerAnalyticsController.js";

const router = express.Router();

router.get("/overview", protect, authorize("admin"), getCustomerAnalyticsOverview);
router.get("/cac", protect, authorize("admin"), getCustomerAnalyticsCAC);
router.get("/ltv", protect, authorize("admin"), getCustomerAnalyticsLTV);
router.get("/ratio", protect, authorize("admin"), getCustomerAnalyticsRatio);
router.get("/cohorts", protect, authorize("admin"), getCustomerAnalyticsCohorts);
router.get("/customers", protect, authorize("admin"), getCustomerAnalyticsCustomers);
router.get("/channels", protect, authorize("admin"), getCustomerAnalyticsChannels);
router.get("/trends", protect, authorize("admin"), getCustomerAnalyticsTrends);

export default router;
