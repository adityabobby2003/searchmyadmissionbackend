import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Needed because __dirname doesn't exist in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public"));
  },
  filename: (req, file, cb) => {
    // Always overwrite the same file
    cb(null, "College Predictor Data.xlsx");
  },
});

// File filter (only allow excel)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed"), false);
  }
};

const uploadExcel = multer({
  storage,
  fileFilter,
});

export default uploadExcel;