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

// ✅ Load environment variables before using them
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const stripeKey = (process.env.STRIPE_SECRET_KEY || "").trim();
const mongouri = process.env.Mongo_uri || "";

// ✅ Debug logs to check if env variables are loading
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

// ✅ Initialize Stripe
export const stripe = new Stripe(stripeKey, { apiVersion: "latest" as Stripe.LatestApiVersion });


// ✅ Initialize cache
export const myCache = new NodeCache();

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// ✅ Base route to test API
app.get("/", (req, res) => {
    res.status(200).send("API is working - v1");
});

// ✅ Serve static uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Mount Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/coupon", couponRoute);
app.use("/api/v1/Stats", statsroute);

// ✅ Error handling middleware (must be last)
app.use(errormiddleware);

// ✅ Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});
