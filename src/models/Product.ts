import mongoose, { Schema, Document, HydratedDocument } from "mongoose";

// 📸 Photo Interface
interface IPhoto {
  url: string;
  altText?: string;
  isPrimary?: boolean;
  path: string;
}

// ⭐ Review Interface
interface IReview {
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
}

// 🛒 Product Interface
export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  isActive: boolean;
  photos: IPhoto[];
  createdAt?: Date;
  updatedAt?: Date;
  isInStock: boolean; // virtual
  reviews: IReview[];
  rating: number;
  numOfReviews: number;
}

// 📸 Photo Schema
const PhotoSchema: Schema<IPhoto> = new Schema({
  url: {
    type: String,
    required: [true, "Photo URL is required"],
    trim: true,
  },
  altText: {
    type: String,
    trim: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  path: {
    type: String,
    required: [true, "Photo path is required"],
  },
});

// ⭐ Review Schema
const ReviewSchema: Schema<IReview> = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// 📦 Product Schema
const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    category: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    photos: {
      type: [PhotoSchema],
      default: [],
    },
    reviews: {
      type: [ReviewSchema],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 📦 Virtual property
ProductSchema.virtual("isInStock").get(function (this: HydratedDocument<IProduct>) {
  return this.stock > 0;
});

// ✅ Export Model
export const Product = mongoose.model<IProduct>("Product", ProductSchema);
