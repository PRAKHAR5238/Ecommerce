import mongoose, { Document, Schema } from "mongoose";

// Define the interface for the Coupon model
export interface ICoupon extends Document {
    code: string;
    discountValue: number;
    discountType: string;
    expirationDate: Date;
    usageLimit: number;
    applicableProducts: string[];
    applicableCategories: string[];
}

// Define the schema for Coupon
const couponSchema = new Schema<ICoupon>({
    code: { type: String, required: true },
    discountValue: { type: Number, required: true },
    discountType: { type: String, required: true },
    expirationDate: { type: Date, required: true },
    usageLimit: { type: Number, default: 1 },
    applicableProducts: { type: [String], default: [] },
    applicableCategories: { type: [String], default: [] },
});

// Create and export the Coupon model
export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
