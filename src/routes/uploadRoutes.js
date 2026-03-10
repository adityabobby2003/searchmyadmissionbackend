import express from "express";
import uploadExcel from "../middleware/uploadExcel.js";

const router = express.Router();

router.post(
  "/upload-excel",
  uploadExcel.single("file"),
  (req, res) => {
    res.json({
      message: "Excel file uploaded and replaced successfully",
    });
  }
);

export default router;