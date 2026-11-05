import express from "express";
import { body } from "express-validator";
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from "../controllers/expenseController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

const validation = [
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("amount").isFloat({ min: 0 }).withMessage("Amount must be a valid non-negative number"),
  body("category")
    .isIn(["marketing", "shipping", "packaging", "salary", "maintenance", "operations", "other"])
    .withMessage("Invalid category"),
  body("date").optional().isISO8601().withMessage("Date must be valid"),
  body("paymentMethod")
    .optional()
    .isIn(["cash", "bank", "card", "paypal", "stripe", "other", ""])
    .withMessage("Invalid payment method"),
];

router.get("/", protect, authorize("admin"), getExpenses);
router.post("/", protect, authorize("admin"), validation, createExpense);
router.put("/:id", protect, authorize("admin"), validation, updateExpense);
router.delete("/:id", protect, authorize("admin"), deleteExpense);

export default router;
