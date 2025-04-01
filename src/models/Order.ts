import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  photos: [
    {
      url: {
        type: String,
        required: true,
      },
      altText: {
        type: String,
        required: true,
      },
      isPrimary: {
        type: Boolean,
        default: false,
      },
      _id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
  ],
});

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
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
      country: {
        type: String,
        required: true,
      },
      pinCode: {
        type: String,
        required: true,
      },
    },

    user: {
      type: String,
      // ref: "User",
      required: true,
    },

    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
    shippingCharges: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },

    orderItems: [orderItemSchema],
  },
  {
    timestamps: true,
  }
);

export const Order = mongoose.model("Order", orderSchema);
