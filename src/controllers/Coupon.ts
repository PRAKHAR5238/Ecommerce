import { TryCatch } from "../middleware/error";
import { NextFunction, Response, Request } from "express";
import { Coupon } from "../models/Coupon";
import ErrorHandler from "../utils/utilityclass";
import { User } from "../models/user";
import { stripe } from "../app.js";

// Create Payment Intent
export const createPaymentIntent = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.query;

  if (!id) return next(new ErrorHandler("User ID is required", 400));

  const user = await User.findById(id).select("name");
  if (!user) return next(new ErrorHandler("Please login first", 401));

  const { currency = "usd", paymentMethodId, amount = 50, name = "Default Product Name", description = "No description provided" } = req.body;

  const totalAmount = Math.round(amount * 100); // Convert to cents

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency,
      payment_method: paymentMethodId, // Can confirm later on frontend
      description,
      metadata: { userId: user.id, productName: name },
      automatic_payment_methods: { enabled: true },
    });

    res.status(201).json({ success: true, client_secret: paymentIntent.client_secret });
  } catch (error: any) {
    next(new ErrorHandler(error.message, 500));
  }
});

// Create New Coupon
export const newCoupon = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { code, discountValue, discountType, expirationDate, usageLimit = 1, applicableProducts = [], applicableCategories = [] } = req.body;

  if (!code || !discountValue || !discountType || !expirationDate) {
    return next(new ErrorHandler("All required fields must be provided", 400));
  }

  const existingCoupon = await Coupon.findOne({ code });
  if (existingCoupon) return next(new ErrorHandler("Coupon code already exists", 409));

  const coupon = await Coupon.create({
    code,
    discountValue,
    discountType,
    expirationDate,
    usageLimit,
    applicableProducts,
    applicableCategories,
  });

  res.status(201).json({ success: true, message: "Coupon created successfully", coupon });
});

// Apply Discount Coupon
export const applyDiscount = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { coupon } = req.query;

  if (!coupon) return next(new ErrorHandler("Coupon code is required", 400));

  const discount = await Coupon.findOne({ code: coupon });
  if (!discount) return next(new ErrorHandler("Invalid coupon code", 400));

  res.status(200).json({ success: true, discount: discount.discountValue });
});

// Get All Coupons
export const allCoupons = TryCatch(async (req: Request, res: Response) => {
  const coupons = await Coupon.find();

  res.status(200).json({
    success: true,
    coupons,
    message: coupons.length ? "Coupons retrieved successfully" : "No coupons found",
  });
});

// Delete Coupon by ID
export const deleteCoupon = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) return next(new ErrorHandler("Coupon ID is required", 400));

  const coupon = await Coupon.findById(id);
  if (!coupon) return next(new ErrorHandler("Coupon not found", 404));

  await coupon.deleteOne();

  res.status(200).json({ success: true, message: "Coupon deleted successfully" });
});
