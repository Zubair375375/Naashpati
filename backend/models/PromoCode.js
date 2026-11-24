import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 32,
    },
    discountPercent: {
      type: Number,
      required: true,
      min: 0.01,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    validFrom: {
      type: Date,
      default: null,
    },
    validUntil: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },
  },
  { timestamps: true },
);

promoCodeSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);

export default PromoCode;
