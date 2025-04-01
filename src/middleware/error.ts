import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/utilityclass"; // Make sure to import the correct class
import { ControllerType } from "../types/type";
import { Order } from "../models/Order";
import { reducestock } from "../utils/features";
import { myCache } from "../app";

// Enhanced error middleware
export const errormiddleware: any = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Ensure that statusCode defaults to 500 if not provided
  err.statusCode || 500;
  err.message || "An unexpected error occurred";
  console.log(err);

  return res.status(404).json({
    success: false,
    message: err.message,
  });
};

export const TryCatch:any =
  (func: ControllerType) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };






 