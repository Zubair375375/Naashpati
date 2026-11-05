import express from "express";
import { body } from "express-validator";
import {
  createFinancialAccount,
  createFinancialTransaction,
  deleteFinancialAccount,
  deleteFinancialTransaction,
  getCashFlowDashboard,
  getFinancialAccounts,
  getFinancialReport,
  getFinancialTransactions,
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
