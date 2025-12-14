import express from "express";
import fs from "fs";
import path from "path";
import PdfAudit from "../models/PdfAudit.js";
import { sha256 } from "../utils/hash.js";
import { signPdf } from "../utils/pdfSigner.js";

const router = express.Router();

// Ensure signed directory exists
const signedDir = "./signed";
if (!fs.existsSync(signedDir)) {
  fs.mkdirSync(signedDir, { recursive: true });
}

router.post("/sign-pdf", async (req, res) => {
  try {
    const { pdfId, signatureBase64, coords } = req.body;

    if (!pdfId || !signatureBase64 || !coords) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const pdfPath = `./pdfs/${pdfId}.pdf`;
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: "PDF not found" });
    }

    const originalPdf = fs.readFileSync(pdfPath);
    const originalHash = sha256(originalPdf);

    const signedPdf = await signPdf(
      originalPdf,
      Buffer.from(signatureBase64, "base64"),
      coords
    );

    const signedHash = sha256(signedPdf);

    // Try to save audit, but don't fail if MongoDB is not connected
    try {
      await PdfAudit.create({
        pdfId,
        originalHash,
        signedHash,
      });
    } catch (auditError) {
      console.warn("Failed to save audit (MongoDB may not be connected):", auditError.message);
    }

    const signedPath = `./signed/${pdfId}-signed.pdf`;
    fs.writeFileSync(signedPath, signedPdf);

    res.json({
      url: `/signed/${pdfId}-signed.pdf`,
    });
  } catch (error) {
    console.error("Error signing PDF:", error);
    res.status(500).json({ error: error.message || "Failed to sign PDF" });
  }
});

export default router;
