import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  batchAllocations: [
    {
      batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
      },
      batchNumber: {
        type: String,
        required: true,
        trim: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    customerSnapshot: {
      name: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["stripe", "paypal", "demo"],
    },
    paymentResult: {
      id: String,
      status: String,
      email_address: String,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: Date,
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    idempotency: {
      createOrderKey: {
        type: String,
        trim: true,
        default: "",
      },
      paymentConfirmKey: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ isPaid: 1, createdAt: -1 });
orderSchema.index({ isDelivered: 1, createdAt: -1 });
orderSchema.index({ "orderItems.product": 1, createdAt: -1 });
orderSchema.index({ "customerSnapshot.email": 1, createdAt: -1 });
orderSchema.index(
  { "idempotency.createOrderKey": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "idempotency.createOrderKey": { $type: "string", $ne: "" },
    },
  },
);
orderSchema.index(
  { "idempotency.paymentConfirmKey": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "idempotency.paymentConfirmKey": { $type: "string", $ne: "" },
    },
  },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
