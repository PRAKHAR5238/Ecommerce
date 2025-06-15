import express from "express";
import { adminOnly } from "../middleware/auth";
import {
  allCoupons,
  applyDiscount,
  newCoupon,
  deleteCoupon,
  createPaymentIntent,
  updateCoupon,
  getCoupon,
} from "../controllers/Coupon";

const app = express.Router();
app.post("/create", adminOnly, createPaymentIntent);
// Route to create a new coupon (admin only)
app.post("/newcoupon", adminOnly, newCoupon);

// Route to apply a discount
app.get("/discount", applyDiscount);

// Route to get all coupons
app.get("/allcoupons", adminOnly, allCoupons);
// Route to delete a coupon by ID
app
  .route("/:id")
  .get(adminOnly, getCoupon)
  .put(adminOnly, updateCoupon)
  .delete(adminOnly, deleteCoupon);

// Export the router
export default app;
