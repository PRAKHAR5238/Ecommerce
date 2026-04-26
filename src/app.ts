import express from "express";
import userRoute from "./routes/user.js";
import { connectDB } from "./utils/features.js";
import { errormiddleware } from "./middleware/error.js";
import productRoute from "./routes/Product.js";
import couponRoute from "./routes/Coupon.js";
import orderRoute from "./routes/Order.js";
import statsroute from "./routes/Stats.js";
import NodeCache from "node-cache";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import Stripe from "stripe";
import dotenv from "dotenv";
import {v2 as cloudniary} from 'cloudinary';
// ✅ Load environment variables
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;
const stripeKey = (process.env.STRIPE_SECRET_KEY || "").trim();
const mongouri = (process.env.Mongo_uri || "").trim();

// ✅ Debugging logs
console.log("Stripe Key Loaded:", stripeKey ? "✅ Yes" : "❌ No");
console.log("MongoDB URI:", mongouri ? "✅ Loaded" : "❌ Missing");

// ✅ Ensure Mongo URI is provided
if (!mongouri) {
    console.error("❌ MongoDB connection string is missing!");
    process.exit(1);
}

// ✅ Ensure Stripe Key is provided
if (!stripeKey) {
    console.error("❌ STRIPE_SECRET_KEY is missing!");
    process.exit(1);
}

// ✅ Connect to the database
connectDB(mongouri);
console.log("Cloudinary config:", {
    CLOUD_NAME: process.env.CLOUD_NAME,
    API_KEY: process.env.API_KEY,
    API_SECRET: process.env.API_SECRET ? "✅ Loaded" : "❌ Missing"
  });
  


// ✅ Initialize Stripe with API Version
export const stripe = new Stripe(stripeKey, {
    apiVersion: "2025-02-24.acacia" as any,
});

console.log("✅ Stripe initialized successfully!");
console.log("Checking Environment Variables...");
console.log("PORT:", process.env.PORT);
console.log("Mongo_uri:", process.env.Mongo_uri ? "✅ Loaded" : "❌ Missing");
console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "✅ Loaded" : "❌ Missing");

// ✅ Initialize cache
export const myCache = new NodeCache();

// ✅ Middleware
app.use(cors({
  origin: "*",
  credentials: true,
}));

app.use(express.json());
app.use(morgan("dev"));

// ✅ Base route to test API
app.get("/", (req, res) => {
    res.status(200).send("API is working - v1");
});

// ✅ Serve static uploads directory
app.use("/uploads", express.static(path.resolve("uploads")));

// ✅ Mount Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/coupon", couponRoute);
app.use("/api/v1/Stats", statsroute);

// ✅ Error handling middleware (must be last)
app.use(errormiddleware);

// ✅ Start the server (0.0.0.0 required for Render and other PaaS port detection)
app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 Server listening on 0.0.0.0:${port}`);
});
