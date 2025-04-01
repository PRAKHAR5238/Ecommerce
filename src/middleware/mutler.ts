import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Disk storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Ensure the 'uploads' folder exists
  },
  filename: (req, file, cb) => {
    const id = uuidv4();
    const extension = path.extname(file.originalname); // gets the extension including the dot
    const uniqueFilename = `${id}${extension}`;
    cb(null, uniqueFilename);
  },
});

// This field name must match what you send from the frontend ("photos")
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).array("photos", 10); // <--- FIELD NAME IS 'photos'
