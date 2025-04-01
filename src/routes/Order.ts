import express from "express";
import { adminOnly } from "../middleware/auth.js";
import { Neworder, Myorders, AllOrders, getSingleOrder, processorder, deleteOrder } from "../controllers/Order.js";

const orderRouter = express.Router();

// Route to create a new order
orderRouter.post("/new", Neworder);

// Route to get user-specific orders
orderRouter.get("/Myorders", Myorders);

// Route to get all orders (admin only)
orderRouter.get("/AllOrders", adminOnly, AllOrders);

// Route to get a single order by ID
orderRouter
  .route("/:id")
  .get(getSingleOrder).put(adminOnly,processorder).delete(adminOnly,deleteOrder)
 

export default orderRouter;
