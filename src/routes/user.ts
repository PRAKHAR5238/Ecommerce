import express from "express";
import {
  getAllUsers,
  newUser,
  getUser,
  deleteUser,
  updateUserRole,
} from "../controllers/user.js";
import { adminOnly } from "../middleware/auth.js";
import { upload } from "../middleware/mutler.js";

const app = express.Router(); // ✅ This is the router you are exporting

// ✅ Register your route here (NOT on another router)
app.put("/:id/role", updateUserRole); // ✅ Keep it clean


// Other routes
app.post("/new", newUser);
app.get("/all", adminOnly, getAllUsers);

app.route("/:id")
  .get(getUser)
  .delete(adminOnly, deleteUser); // Only admin can delete

export default app;
