import { TryCatch } from "../middleware/error";
import { NextFunction, Response, Request } from "express";
import { Coupon } from "../models/Coupon";
import ErrorHandler from "../utils/utilityclass";
import { User } from "../models/user";
import { Product } from "../models/Product";
import Stripe from "stripe";
import dotenv from "dotenv";

// ✅ Load environment variables at the very top
dotenv.config();

// ✅ Ensure STRIPE_SECRET_KEY is set
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY?.trim(); // Trim to remove extra spaces
if (!STRIPE_KEY) {
  throw new Error("❌ Missing STRIPE_SECRET_KEY in environment variables");
}

// ✅ Initialize Stripe
const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: "2024-12-18.acacia" as any,
});

// ✅ Create Payment Intent
export const createPaymentIntent = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.query;
  const user = await User.findById(id).select("name");

  if (!user) return next(new ErrorHandler("❌ Please log in first", 401));

  const { currency = "usd", paymentMethodId, amount = 50, name = "Default Product", description = "No description provided" } = req.body;
  const totalAmount = Math.round(amount * 100); // Convert to cents

  // ✅ Create Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency,
    payment_method: paymentMethodId,
    description,
    metadata: { userId: user.id, productName: name },
    automatic_payment_methods: { enabled: true },
  });

  res.status(201).json({
    success: true,
    client_secret: paymentIntent.client_secret, // ✅ Send this to the frontend
  });
});

// ✅ Create New Coupon
export const newCoupon = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { code, discountValue, discountType, expirationDate, usageLimit = 1, applicableProducts = [], applicableCategories = [] } = req.body;

  if (!code || !discountValue || !discountType || !expirationDate) {
    return next(new ErrorHandler("❌ Missing required fields", 400));
  }

  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() }); // ✅ Case-insensitive search
  if (existingCoupon) return next(new ErrorHandler("⚠️ Coupon code already exists", 409));

  const coupon = await Coupon.create({ code: code.toUpperCase(), discountValue, discountType, expirationDate, usageLimit, applicableProducts, applicableCategories });

  res.status(201).json({ success: true, message: "✅ Coupon created successfully", coupon });
});

// ✅ Apply Discount Coupon
export const applyDiscount = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { coupon } = req.query;
  if (!coupon) return next(new ErrorHandler("❌ Coupon code is required", 400));

  const discount = await Coupon.findOne({ code: coupon.toString().toUpperCase() }); // ✅ Case-insensitive match
  if (!discount) return next(new ErrorHandler("❌ Invalid coupon code", 400));

  res.status(200).json({ success: true, discount: discount.discountValue });
});

// ✅ Get All Coupons
export const allCoupons = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const coupons = await Coupon.find();
  if (!coupons.length) return res.status(404).json({ success: false, message: "⚠️ No coupons found" });

  res.status(200).json({ success: true, coupons });
});

// ✅ Delete Coupon by ID
export const deleteCoupon = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  if (!id) return next(new ErrorHandler("❌ Coupon ID is required", 400));

  const coupon = await Coupon.findById(id);
  if (!coupon) return next(new ErrorHandler("❌ Coupon not found", 404));

  await coupon.deleteOne();
  res.status(200).json({ success: true, message: "✅ Coupon deleted successfully" });
});
