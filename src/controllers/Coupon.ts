import { TryCatch } from "../middleware/error";
import { NextFunction, Response, Request } from "express";
import { Coupon, ICoupon } from "../models/Coupon";
import ErrorHandler from "../utils/utilityclass";
import { User } from "../models/user";
import { stripe } from "../app.js";
import { Document } from "mongoose";

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
  const {
    code,
    discountValue,
    discountType,
    expirationDate,
    usageLimit = 1,
    applicableProducts = [],
    applicableCategories = [],
  } = req.body;

  // Validate required fields: code and discountValue (assuming code should be required too)
  if (!code || discountValue === undefined || discountValue === null) {
    return next(new ErrorHandler("Coupon code and discount value are required", 400));
  }

  // Optional: discountValue should be a positive number (or zero, if you allow)
  if (typeof discountValue !== "number" || discountValue < 0) {
    return next(new ErrorHandler("Discount value must be a non-negative number", 400));
  }

  // Check if coupon code already exists
  const existingCoupon = await Coupon.findOne({ code });
  if (existingCoupon) return next(new ErrorHandler("Coupon code already exists", 409));

  // Create coupon with optional fields if provided
  const coupon = await Coupon.create({
    code,
    discountValue,
    discountType,         // optional
    expirationDate,       // optional
    usageLimit,           // defaults to 1 if not provided
    applicableProducts,   // defaults to empty array
    applicableCategories, // defaults to empty array
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


export const updateCoupon = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { code, discountValue } = req.body;

    // Validate if coupon ID is provided
    if (!id) return next(new ErrorHandler("Coupon ID is required", 400));

    // Find the coupon by its ID
    const coupon = await Coupon.findById(id);

    // Handle case where coupon is not found
    if (!coupon) return next(new ErrorHandler("Coupon not found", 404));

    let updated = false;

    // Update code if it's provided and different from the current code
    if (code && code !== coupon.code) {
      coupon.code = code;
      updated = true;
    }

    // Update amount if it's provided, is a valid number, and differs from the current amount
    if (typeof discountValue === "number" && discountValue !== coupon.amount && discountValue > 0) {
      coupon.discountValue = discountValue;
      updated = true;
    }

    // If any update is made, save the coupon
    if (updated) {
      await coupon.save();
    }

    return res.status(200).json({
      success: true,
      message: `Coupon ${coupon.code} updated successfully`,
    });
  }
);
export const getCoupon = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { code, id } = req.params;

  if (!code && !id) {
    return next(new ErrorHandler("Coupon code or ID is required", 400));
  }
 
 
  const coupon = code
    ? await Coupon.findOne({ code })
    : await Coupon.findById(id);

  if (!coupon) {
    return next(new ErrorHandler("Coupon not found", 404));
  }

  res.status(200).json({
    success: true,
    coupon,
  });
});
