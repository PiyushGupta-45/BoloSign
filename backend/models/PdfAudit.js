import mongoose from "mongoose";

const PdfAuditSchema = new mongoose.Schema({
  pdfId: String,
  originalHash: String,
  signedHash: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("PdfAudit", PdfAuditSchema);
