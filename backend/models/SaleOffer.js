import mongoose from "mongoose";

const saleOfferSchema = new mongoose.Schema(
  {
    saleName: {
      type: String,
      required: [true, "Sale name is required"],
      trim: true,
      minlength: [2, "Sale name must be at least 2 characters"],
      maxlength: [100, "Sale name cannot be more than 100 characters"],
    },
    saleNameColor: {
      type: String,
      trim: true,
      default: "#000000",
    },
    productName: {
      type: String,
      trim: true,
      maxlength: [100, "Product name cannot be more than 100 characters"],
      default: "",
    },
    productNameColor: {
      type: String,
      trim: true,
      default: "#393939",
    },
    productDescription: {
      type: String,
      trim: true,
      maxlength: [
        500,
        "Product description cannot be more than 500 characters",
      ],
      default: "",
    },
    productDescriptionColor: {
      type: String,
      trim: true,
      default: "#383838",
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    banner: {
      type: String,
      required: [true, "Sale banner is required"],
      trim: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const SaleOffer = mongoose.model("SaleOffer", saleOfferSchema);

export default SaleOffer;
