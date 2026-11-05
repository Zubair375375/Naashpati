import mongoose from "mongoose";

const financialTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      trim: true,
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Transaction date is required"],
      default: Date.now,
    },
    type: {
      type: String,
      enum: ["income", "expense", "transfer", "adjustment", "refund"],
      required: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      default: "other",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "bank",
        "card",
        "paypal",
        "stripe",
        "cod",
        "wallet",
        "other",
      ],
      default: "cash",
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialAccount",
      default: null,
    },
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialAccount",
      default: null,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialAccount",
      default: null,
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: "",
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    relatedExpense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "posted", "reversed"],
      default: "posted",
    },
    reversalOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FinancialTransaction",
      default: null,
    },
    isBusinessImpact: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      enum: ["order", "expense", "manual", "transfer", "refund", "adjustment"],
      default: "manual",
    },
  },
  { timestamps: true },
);

financialTransactionSchema.index({ date: -1 });
financialTransactionSchema.index({ account: 1, date: -1 });
financialTransactionSchema.index(
  { relatedOrder: 1, source: 1 },
  {
    unique: true,
    partialFilterExpression: {
      relatedOrder: { $type: "objectId" },
      source: { $in: ["order", "refund"] },
    },
  },
);
financialTransactionSchema.index({ type: 1, status: 1, date: -1 });

financialTransactionSchema.set("toJSON", {
  transform: (_, doc) => {
    const obj = doc.toObject();
    obj.amount = Number(obj.amount || 0);
    return obj;
  },
});

const FinancialTransaction = mongoose.model(
  "FinancialTransaction",
  financialTransactionSchema,
);

export default FinancialTransaction;
