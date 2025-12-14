import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./pdfs";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // ID will be the timestamp + random number
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ".pdf");
  },
});

const upload = multer({ storage: storage });

router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // Validate file type
    if (req.file.mimetype !== "application/pdf") {
      // Delete the uploaded file if it's not a PDF
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Only PDF files are allowed." });
    }

    // Return the filename without extension as the ID
    const pdfId = path.parse(req.file.filename).name;
    res.json({ pdfId });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: error.message || "Failed to upload file" });
  }
});

export default router;
