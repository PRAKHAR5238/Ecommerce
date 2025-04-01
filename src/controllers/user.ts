import { Request, Response, NextFunction } from "express";
import { NewUserRequestBody } from "../types/type.js";
import { User } from "../models/user.js";
import { TryCatch } from "../middleware/error.js";
import ErrorHandler from "../utils/utilityclass.js";

// Controller for creating a new user
export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>, // Request with body containing user data
    res: Response, // Response object to send back the result
    next: NextFunction // Middleware function to pass control to the next handler
  ) => {
    // Destructure the required fields from the request body
    const { name, email, photo, gender, _id, dob } = req.body;

    // Check if all required fields are provided
    if (!_id || !name || !email || !photo || !gender || !dob) {
      // If any field is missing, return a 400 error with a message
      return next(new ErrorHandler("Please fill in all required details.", 400));
    }

    // Check if a user with the given _id already exists in the database
    const existingUser = await User.findById(_id);
    if (existingUser) {
      // If user exists, return a success response with a welcome message
      return res.status(200).json({
        success: true,
        message: `Welcome back, ${existingUser.name}!`,
      });
    }

    // If the user does not exist, create a new user in the database
    const newUser = await User.create({ name, email, photo, gender, _id, dob });

    // Return a success response with the newly created user data
    res.status(201).json({
      success: true,
      message: `User created successfully, ${newUser.name}.`,
      user: newUser,
    });
  }
);

// Controller for fetching all users
export const getAllUsers = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // Find all users in the database and exclude the password field
    const users = await User.find().select("-password");

    // Return a success response with the list of users
    res.status(200).json({
      success: true,
      users,
    });
  }
);

// Controller for fetching a single user by ID
export const getUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract the user ID from the request parameters
    const { id } = req.params;
    console.log(req.params);
    
    // Find the user by ID in the database
    const user = await User.findById(id);
    if (!user) {
      // If the user is not found, return a 404 error with a message
      return next(new ErrorHandler("User not found.", 404));
    }

    // Return a success response with the user's data
    res.status(200).json({
      success: true,
      user,
    });
  }
);

// Controller for deleting a user by ID
export const deleteUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    // Extract the user ID from the request parameters
    const { id } = req.params;

    // Find and delete the user by ID in the database
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      // If the user is not found, return a 404 error with a message
      return next(new ErrorHandler("User not found.", 404));
    }

    // Return a success response confirming the deletion, including the deleted user's details
    res.status(200).json({
      success: true,
      message: `User with ID ${id} has been deleted successfully.`,
      user, // Optional: returning the deleted user's details
    });
  }
);
