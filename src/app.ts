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
import cors from "cors"
import path from "path";
import Stripe from "stripe";

const app = express();
const port = process.env.PORT || 4000;
const stripeKey = process.env.STRIPE_SECRET_KEY|| "";
const mongouri = process.env.Mongo_uri || "";

export const stripe = new Stripe(stripeKey);


// Ensure Mongo URI is provided
if (!mongouri) {
    console.error("MongoDB connection string is missing!");
    process.exit(1); // Exit if no connection string
}

// Connect to the database
connectDB(mongouri);

// Initialize cache
export const myCache = new NodeCache();

// Middleware to parse JSON
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Base route to test API availability
app.get("/", (req, res) => {
    res.status(200).send("API is working - v1");
});
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Mount user-related routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/order", orderRoute);
app.use("/api/v1/coupon", couponRoute);
app.use("/api/v1/Stats", statsroute);

// Serve static files from the "uploads" directory
app.use("/uploads", express.static("uploads"));

// Error handling middleware (should be the last middleware)
app.use(errormiddleware);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
