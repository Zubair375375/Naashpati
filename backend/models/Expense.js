import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Expense description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    amount: {
      type: Number,
      required: [true, "Expense amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Expense category is required"],
      trim: true,
      enum: [
        "marketing",
        "shipping",
        "packaging",
        "salary",
        "maintenance",
        "operations",
        "other",
      ],
    },
    date: {
      type: Date,
      required: [true, "Expense date is required"],
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      trim: true,
      enum: ["cash", "bank", "card", "paypal", "stripe", "other", ""],
      default: "other",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial", "reversed"],
      default: "paid",
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    supplierName: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "Supplier name cannot exceed 120 characters"],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },
    campaign: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "Campaign cannot exceed 120 characters"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1, date: -1 });
expenseSchema.index({ product: 1, date: -1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
