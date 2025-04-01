import ErrorHandler from "../utils/utilityclass";
import { TryCatch } from "./error";
import { User } from "../models/user"; // Ensure User model is correctly implemented
import express, { Request, Response, NextFunction } from "express";

export const adminOnly = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.query.id || req.params.id as string;

    if (!id) {
        return next(new ErrorHandler("ID is required", 400));
    }

    // Fetch user by ID (assuming `User` has a `findById` or equivalent method)
    const user = await User.findById(id);
    if (!user) {
       
        
        return next(new ErrorHandler("User not found", 404));
    }

    // Check if user has admin role
    if (user.role !== "admin") {
        return next(new ErrorHandler("Access denied. Admins only.", 403));
    }

    next(); // Pass control to the next middleware
});
