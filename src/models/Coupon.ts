import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the Coupon model
export interface ICoupon extends Document {
    code: string;
    amount:number
    discountValue: number;
    discountType: string;
    expirationDate: Date;
    usageLimit: number;
    applicableProducts: string[];
    applicableCategories: string[];
}

// Define the schema for Coupon
const couponSchema = new Schema<ICoupon>({
    amount: {
        type: Number,
        required: [false, "Please enter the Discount Amount"],
      },
    code: { type: String, required: true, unique: true },
  discountValue: { type: Number, required: true },
  discountType: { type: String, required: false },         // no longer required
  expirationDate: { type: Date, required: false },          // no longer required
  usageLimit: { type: Number, default: 1 },
  applicableProducts: { type: [String], default: [] },
  applicableCategories: { type: [String], default: [] },
});

// Create and export the Coupon model
export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);


