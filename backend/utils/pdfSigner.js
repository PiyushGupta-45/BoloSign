import { PDFDocument } from "pdf-lib";

export async function signPdf(
  pdfBytes,
  signatureImage,
  coords
) {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const page = pdfDoc.getPages()[0];

  // Try to detect image format and embed accordingly
  // Signatures are typically PNG, but we support JPG as well
  let image;
  try {
    // Try PNG first (most common for signatures)
    image = await pdfDoc.embedPng(signatureImage);
  } catch (pngError) {
    try {
      // If PNG fails, try JPG
      image = await pdfDoc.embedJpg(signatureImage);
    } catch (jpgError) {
      throw new Error("Unsupported image format. Please use PNG or JPG.");
    }
  }

  const { width, height } = page.getSize();

  const boxWidth = width * coords.widthPercent;
  const boxHeight = height * coords.heightPercent;

  // Maintain aspect ratio
  const scale = Math.min(
    boxWidth / image.width,
    boxHeight / image.height
  );

  const imgWidth = image.width * scale;
  const imgHeight = image.height * scale;

  page.drawImage(image, {
    x: width * coords.xPercent,
    y: height - height * coords.yPercent - imgHeight,
    width: imgWidth,
    height: imgHeight,
  });

  return await pdfDoc.save();
}
