import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import signPdfRoute from "./routes/signPdf.js";
import uploadRoute from "./routes/upload.js";

dotenv.config(); // 👈 MUST be before mongoose.connect

const app = express();

// Ensure required directories exist
const dirs = ["./pdfs", "./signed"];
dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// MongoDB connection with better error handling
const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/pdf-signer";
mongoose
  .connect(mongoUri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.log("Continuing without MongoDB (audit logging disabled)");
  });

app.use("/api", signPdfRoute);
app.use("/api", uploadRoute);
app.use("/signed", express.static("signed"));
app.use("/pdfs", express.static("pdfs"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Backend running on port ${PORT}`)
);
