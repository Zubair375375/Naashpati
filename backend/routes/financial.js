import express from "express";
import { body } from "express-validator";
import {
  createBreakEvenCost,
  createFinancialAccount,
  createFinancialTransaction,
  deleteBreakEvenCost,
  deleteFinancialAccount,
  deleteFinancialTransaction,
  getBreakEvenCosts,
  getBreakEvenProducts,
  getBreakEvenSummary,
  getBreakEvenTrends,
  getCashFlowDashboard,
  getFinancialAccounts,
  getFinancialReport,
  getFinancialTransactions,
  getBreakEvenCostById,
  simulateBreakEven,
  updateBreakEvenCost,
  updateFinancialAccount,
  updateFinancialTransaction,
} from "../controllers/financialController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const accountValidation = [
  body("name").trim().notEmpty().withMessage("Account name is required"),
  body("type")
    .optional()
    .isIn(["cash", "bank", "wallet", "other"])
    .withMessage("Invalid account type"),
  body("openingBalance")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Opening balance must be zero or greater"),
];

const transactionValidation = [
  body("type")
    .isIn(["income", "expense", "transfer", "adjustment", "refund"])
    .withMessage("Invalid transaction type"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("amount")
    .isFloat({ min: 0 })
    .withMessage("Amount must be zero or greater"),
  body("date").optional().isISO8601().withMessage("Date must be valid"),
];

router.get("/summary", protect, authorize("admin"), getCashFlowDashboard);
router.get("/reports", protect, authorize("admin"), getFinancialReport);
router.get(
  "/break-even/summary",
  protect,
  authorize("admin"),
  getBreakEvenSummary,
);
router.get(
  "/break-even/trends",
  protect,
  authorize("admin"),
  getBreakEvenTrends,
);
router.get(
  "/break-even/products",
  protect,
  authorize("admin"),
  getBreakEvenProducts,
);
router.get("/break-even/costs", protect, authorize("admin"), getBreakEvenCosts);
router.get(
  "/break-even/costs/:id",
  protect,
  authorize("admin"),
  getBreakEvenCostById,
);
router.post(
  "/break-even/costs",
  protect,
  authorize("admin"),
  createBreakEvenCost,
);
router.put(
  "/break-even/costs/:id",
  protect,
  authorize("admin"),
  updateBreakEvenCost,
);
router.delete(
  "/break-even/costs/:id",
  protect,
  authorize("admin"),
  deleteBreakEvenCost,
);
router.post(
  "/break-even/simulate",
  protect,
  authorize("admin"),
  simulateBreakEven,
);
router.get("/accounts", protect, authorize("admin"), getFinancialAccounts);
router.post(
  "/accounts",
  protect,
  authorize("admin"),
  accountValidation,
  createFinancialAccount,
);
router.put(
  "/accounts/:id",
  protect,
  authorize("admin"),
  accountValidation,
  updateFinancialAccount,
);
router.delete(
  "/accounts/:id",
  protect,
  authorize("admin"),
  deleteFinancialAccount,
);
router.get(
  "/transactions",
  protect,
  authorize("admin"),
  getFinancialTransactions,
);
router.post(
  "/transactions",
  protect,
  authorize("admin"),
  transactionValidation,
  createFinancialTransaction,
);
router.put(
  "/transactions/:id",
  protect,
  authorize("admin"),
  updateFinancialTransaction,
);
router.delete(
  "/transactions/:id",
  protect,
  authorize("admin"),
  deleteFinancialTransaction,
);

export default router;
