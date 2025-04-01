import express from "express";
import {
  adminproduct,
  allProductSearch,
  categoryproduct,
  DELETEPRODUCT,
  latestProduct,
  NewProduct,
  singleproduct,
  updateProduct,
} from "../controllers/Product";
import { upload } from "../middleware/mutler";
import { adminOnly } from "../middleware/auth";

const app = express.Router();

// Route to create a new product
// This route is protected and requires admin access
// Middleware `upload` handles file uploads (e.g., photos)
app.post("/new", upload, adminOnly, NewProduct);

// Route to fetch the latest products
// Returns the most recently added products
app.get("/latest", latestProduct);

// Route to fetch all unique product categories
// Useful for filtering products by category
app.get("/category", categoryproduct);

// Route to fetch all products (admin only)
// Restricted to admin users for product management
app.get("/admin-product", adminOnly, adminproduct);
app.get("/search", allProductSearch);
// Routes for single product operations by ID
// - GET: Fetch product details by ID
// - PUT: Update product details (supports file uploads)
// - DELETE: Remove product (admin only)



app
  .route("/:id")
  .get(singleproduct)
  .put(upload, updateProduct)
  .delete(adminOnly, DELETEPRODUCT);

// Export the router to be used in the main application
export default app;
