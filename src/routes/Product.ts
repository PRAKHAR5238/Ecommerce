import express from "express";
import {
  adminproduct,
  allProductSearch,
  allReviewsOfProduct,
  categoryproduct,
  DELETEPRODUCT,
  deleteReview,
  latestProduct,
  NewProduct,
  newReview,
  singleproduct,
  updateProduct,
} from "../controllers/Product";
import { upload } from "../middleware/mutler";
import { adminOnly } from "../middleware/auth";

const app = express.Router();

// ✅ Create new product (with file upload)
app.post("/new", upload.array("photos", 5), adminOnly, NewProduct);

// ✅ Latest products
app.get("/latest", latestProduct);

// ✅ Get all categories
app.get("/category", categoryproduct);

// ✅ Admin-only product listing
app.get("/admin-product", adminOnly, adminproduct);

// ✅ Product search
app.get("/search", allProductSearch);

// ✅ Single product CRUD
app
  .route("/:id")
  .get(singleproduct)
  .put(upload.array("photos", 5), updateProduct) // ✅ Fixed here
  .delete(adminOnly, DELETEPRODUCT);


  app.get("/allreview/:id" ,allReviewsOfProduct)
  app.post("/review/new/:id" ,newReview)
  
    app.delete("/deleteReview/:id" ,deleteReview)


export default app;
