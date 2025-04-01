import express from "express";
import {
  getAllUsers,
  newUser,
  getUser,
  deleteUser,
} from "../controllers/user.js";
import { adminOnly } from "../middleware/auth.js";

const app = express.Router();

// Create a new user
app.post("/new", newUser);

// Get all users (only accessible by admin)
app.get("/all", adminOnly, getAllUsers);

// Get a specific user and delete a user by ID (only accessible by admin for delete)
app.route("/:id")
  .get(getUser)  // Retrieve a specific user
  .delete(adminOnly, deleteUser);  // Only an admin can delete

export default app;
