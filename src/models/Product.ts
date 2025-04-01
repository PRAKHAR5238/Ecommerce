import mongoose, { Schema, Document, HydratedDocument } from "mongoose";

// Define an interface for the Photo document
interface IPhoto {
  url: string;
  altText?: string;
  isPrimary?: boolean;
  path: string;
}

// Define an interface for the Product document
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
  isInStock: boolean; // Virtual property
}

// Define the Photo schema
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

// Define the Product schema
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property for stock status
ProductSchema.virtual("isInStock").get(function (this: HydratedDocument<IProduct>) {
  return this.stock > 0;
});

// Export the Mongoose Model
export const Product = mongoose.model<IProduct>("Product", ProductSchema);
