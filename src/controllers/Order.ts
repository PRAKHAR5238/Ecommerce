import { NextFunction, Response, Request } from "express";
import { TryCatch } from "../middleware/error";
import { invalidatecacheproduct, reducestock } from "../utils/features";
import { Order } from "../models/Order";
import { myCache } from "../app";
import ErrorHandler from "../utils/utilityclass";

export const Neworder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      shippingInfo,
      user,
      subtotal,
      tax,
      total,
      discount = 0,
      shippingCharges = 0,
      orderItems,  // ✅ corrected field name
    } = req.body;

    // Validate required fields
    if (
      !shippingInfo ||
      !user ||
      !subtotal ||
      !tax ||
      !total ||
      !orderItems ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0
    ) {
      return res.status(400).json({
        message: "All required fields must be provided, and order items cannot be empty.",
      });
    }

    // Validate each order item
    for (const item of orderItems) {
      if (!item.product_id || !item.name || typeof item.quantity !== "number" || typeof item.price !== "number") {
        return res.status(400).json({
          message: "Each order item must have product_id, name, quantity, and price.",
        });
      }
    }

    // Ensure discount and shippingCharges are valid numbers
    if (typeof discount !== "number" || typeof shippingCharges !== "number") {
      return res.status(400).json({
        message: "Discount and shipping charges must be valid numbers.",
      });
    }

    try {
      const newOrder = await Order.create({
        shippingInfo,
        user,
        subtotal,
        tax,
        total,
        discount,
        shippingCharges,
        orderItems, // ✅ corrected field name
        status: "Processing",
      });

      await reducestock(orderItems);
      await invalidatecacheproduct({ product: true, order: true, admin: true });

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: newOrder,
      });
    } catch (error) {
      next(error);
    }
  }
);










export const Myorders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.query; // Assuming 'id' is passed in the query string
    let orders = [];

    try {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: "User ID is required in the query",
        });
      }

      // Check if orders are cached for the given user ID
      if (myCache.has(id as string)) {
        // Parse cached orders
        orders = JSON.parse(myCache.get(id as string) as string);
      } else {
        // Fetch orders from the database if not cached
        orders = await Order.find({ user: id });

        // Optionally, cache the orders
        myCache.set(id as string, JSON.stringify(orders));
      }

      // Respond with success
      res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        orders, // Include fetched orders
      });
    } catch (error) {
      next(error); // Pass any error to the error handler middleware
    }
  }
);






export const AllOrders = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    let orders = [];
// ?fraehjnio;feaiopgjehgjerwsopghujeopigjuiopguj?
    try {
      // Check if all orders are cached
      if (myCache.has("allOrders")) {
        // Parse cached orders
        orders = JSON.parse(myCache.get("allOrders") as string);
      } else {
        // Fetch all orders from the database
        orders = await Order.find();

        // Optionally, cache the orders
        myCache.set("allOrders", JSON.stringify(orders));
      }

      // Respond with success
      res.status(200).json({
        success: true,
        message: "All orders fetched successfully",
        orders, // Include all fetched orders
      });
    } catch (error) {
      next(error); // Pass any error to the error handler middleware
    }
  }
);





export const getSingleOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // Extract `id` from request parameters
    const key = `order-${id}`; // Define cache key
    let order;

    try {
      // Check if the specific order is cached
      if (myCache.has(key)) {
        order = JSON.parse(myCache.get(key) as string); // Retrieve order from cache
      } else {
        // Fetch the order from the database with user details populated
        order = await Order.findById(id).populate("user", "name");

        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }

        // Cache the fetched order
        myCache.set(key, JSON.stringify(order));
      }

      // Respond with the order details
      res.status(200).json({
        success: true,
        message: "Order fetched successfully",
        order,
      });
    } catch (error) {
      next(error); // Pass any error to the error handler middleware
    }
  }
);



export const processorder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // Extract `id` from request parameters

    // Find the order by ID
    const order = await Order.findById(id);

    // Check if the order exists
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    // Update order status based on its current status
    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      default:
        order.status = "Delivered";
        break;
    }
  
    await order.save();

    // Invalidate the cache related to orders
    await invalidatecacheproduct({ product: false, order: true, admin: true });

    // Respond with success
    res.status(200).json({
      success: true,
      message: `Order status updated to ${order.status}`,
      order,
    });
  }
);

export const deleteOrder = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // Extract `id` from request parameters

    // Find the order by ID
    const order = await Order.findById(id);

    // Check if the order exists
    if (!order) {
      return next(new ErrorHandler("Order not found", 404));
    }

    // Attempt to delete the order
    await order.deleteOne();

    // Invalidate the cache related to orders
    await invalidatecacheproduct({ product: false, order: true, admin: true });

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Order successfully deleted.",
      orderId: id, // Optionally return the deleted order ID
    });
  }
);