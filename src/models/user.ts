import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";

// TypeScript Interface
interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  photo: string;
  gender: "male" | "female";
  role: "admin" | "user";
  dob: Date;
  age: number; // Virtual property
}

// Mongoose Schema
const schema = new Schema<IUser>(
  {
    _id: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [validator.isEmail, "Invalid email address"],
    },
  },
  {
    timestamps: true, // Automatically creates `createdAt` and `updatedAt`
    toJSON: { virtuals: true }, // Include virtuals in `toJSON` output
    toObject: { virtuals: true }, // Include virtuals in `toObject` output
  }
);

// Virtual property to calculate age
schema.virtual("age").get(function (this: IUser) {
  const today = new Date();
  const birthDate = new Date(this.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Export Mongoose Model
export const User = mongoose.model<IUser>("User", schema);
