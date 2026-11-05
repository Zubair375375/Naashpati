import mongoose from "mongoose";

const financialAccountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Account name is required"],
      trim: true,
      maxlength: [100, "Account name cannot exceed 100 characters"],
    },
    type: {
      type: String,
      enum: ["cash", "bank", "wallet", "other"],
      default: "cash",
    },
    accountNumber: {
      type: String,
      trim: true,
      default: "",
      maxlength: [80, "Account number cannot exceed 80 characters"],
    },
    bankName: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "Bank name cannot exceed 120 characters"],
    },
    currency: {
      type: String,
      default: "PKR",
      trim: true,
      uppercase: true,
      maxlength: [10, "Currency cannot exceed 10 characters"],
    },
    openingBalance: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    currentBalance: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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
  },
  { timestamps: true },
);

financialAccountSchema.set("toJSON", {
  transform: (_, doc) => {
    const obj = doc.toObject();
    obj.openingBalance = Number(obj.openingBalance || 0);
    obj.currentBalance = Number(obj.currentBalance || 0);
    return obj;
  },
});

const FinancialAccount = mongoose.model(
  "FinancialAccount",
  financialAccountSchema,
);

export default FinancialAccount;
