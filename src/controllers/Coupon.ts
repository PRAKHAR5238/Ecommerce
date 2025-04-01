import { TryCatch } from "../middleware/error";
import { NextFunction, Response, Request } from "express";
import { Coupon } from "../models/Coupon";
import ErrorHandler from "../utils/utilityclass";
import { User } from "../models/user";
import { IProduct, Product } from "../models/Product";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia" as any,
});


// Create Payment Intent
export const createPaymentIntent = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query;
  
    const user = await User.findById(id).select("name");
    if (!user) return next(new ErrorHandler("Please login first", 401));
  
    const {
      currency,
      paymentMethodId,
      amount,
      name,
      description,
    }: {
      currency?: string;
      paymentMethodId?: string;
      amount?: number;
      name?: string;
      description?: string;
    } = req.body;
  
    const productName = name || "Default Product Name";
    const productDescription = description || "No description provided";
    const totalAmount = amount && amount > 0 ? Math.round(amount * 100) : 5000; // Default 5000 cents ($50)
    const paymentCurrency = currency || 'usd';
  
    // ✅ Optional: Create a Product in your DB, or skip this step if unnecessary
    // If you're not using Stripe products/prices, you can omit this
  
    // ✅ Create a PaymentIntent to get the client_secret
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: paymentCurrency,
      payment_method: paymentMethodId, // optional here; can confirm later on frontend
      description: productDescription,
      metadata: {
        userId: user.id,
        productName: productName
      },
      automatic_payment_methods: { enabled: true }, // allows multiple payment methods
    });
  
    return res.status(201).json({
      success: true,
      client_secret: paymentIntent.client_secret, // ✅ This is what you want!
    });
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

  if (!code || !discountValue || !discountType || !expirationDate) {
    return next(new ErrorHandler("Please provide all required fields: code, discountValue, discountType, expirationDate, and createdBy.", 400));
  }

  const existingCoupon = await Coupon.findOne({ code });
  if (existingCoupon) {
    return next(new ErrorHandler("A coupon with this code already exists.", 409));
  }

  const coupon = await Coupon.create({
    code,
    discountValue,
    discountType,
    expirationDate,
    usageLimit,
    applicableProducts,
    applicableCategories,
  });

  res.status(201).json({
    success: true,
    message: "Coupon created successfully.",
    coupon,
  });
});

// Apply Discount Coupon
export const applyDiscount = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ code: coupon });
  if (!discount) return next(new ErrorHandler("invalid coupoun code", 400));

  return res.status(200).json({
    success: true,
    discount: discount.discountValue,
  });
});

// Get All Coupons
export const allCoupons = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const coupons = await Coupon.find();

  if (!coupons || coupons.length === 0) {
    return res.status(404).json({
      success: false,
      message: "No coupons found.",
    });
  }

  return res.status(200).json({
    success: true,
    coupons,
  });
});

// Delete Coupon by ID
export const deleteCoupon = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id) {
    return next(new ErrorHandler("Coupon ID is required.", 400));
  }

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    return next(new ErrorHandler("Coupon not found.", 404));
  }

  await coupon.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Coupon deleted successfully.",
  });
});
