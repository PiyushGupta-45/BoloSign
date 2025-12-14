import { useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import SignaturePad from "./SignaturePad";
import DraggableSignature from "./DraggableSignature";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

/* ✅ CORRECT pdfjs worker setup for Vite + react-pdf@10 */
// Use the worker from public folder for better compatibility
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export default function PdfViewer() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfId, setPdfId] = useState(null);
  const [numPages, setNumPages] = useState(null);

  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  const [signature, setSignature] = useState(null); // { x, y, image }
  const [showSigModal, setShowSigModal] = useState(false);
  const [lockSignature, setLockSignature] = useState(false);

  const pdfRef = useRef(null);

  /* -------------------- Upload PDF -------------------- */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setPdfFile(file);
      setSignature(null);
      setLockSignature(false);

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
      }

      const data = await res.json();
      setPdfId(data.pdfId);
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Failed to upload PDF: ${error.message}`);
      setPdfFile(null);
    }
  };

  /* -------------------- Drop Signature -------------------- */
  const handlePdfClick = (e) => {
    if (!signature || lockSignature) return;

    const rect = pdfRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Adjust for signature image dimensions (center the signature on click)
    setSignature((prev) => ({
      ...prev,
      x: clickX - 75, // Half of signature width (150/2)
      y: clickY - 30, // Half of signature height (60/2)
    }));
  };

  /* -------------------- Save Signed PDF -------------------- */
  const saveSignedPdf = async () => {
    if (!signature || !pdfId) {
      alert("Add a signature first");
      return;
    }

    if (!lockSignature) {
      alert("Please place the signature first by clicking the 'Place' button");
      return;
    }

    if (!pageSize.width || !pageSize.height) {
      alert("PDF is still loading. Please wait.");
      return;
    }

    try {
      const xPercent = signature.x / pageSize.width;
      const yPercent = signature.y / pageSize.height;

      // Extract base64 data (handle both data:image/png;base64, and plain base64)
      const base64 = signature.image.includes(",")
        ? signature.image.split(",")[1]
        : signature.image;

      const res = await fetch("http://localhost:5000/api/sign-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfId,
          signatureBase64: base64,
          coords: {
            xPercent,
            yPercent,
            widthPercent: 150 / pageSize.width,
            heightPercent: 60 / pageSize.height,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Signing failed: ${res.statusText}`);
      }

      const data = await res.json();
      
      // Download the signed PDF instead of opening in new tab
      const downloadUrl = `http://localhost:5000${data.url}`;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `signed-${pdfId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Signing error:", error);
      alert(`Failed to sign PDF: ${error.message}`);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-6 flex flex-col items-center">
      {/* Upload */}
      {!pdfFile && (
        <div className="mt-20 w-full max-w-2xl">
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 bg-white shadow-lg hover:border-blue-400 transition-colors">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Upload PDF Document</h3>
              <p className="text-gray-500 mb-6">Select a PDF file to add your signature</p>
              <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer shadow-md hover:shadow-lg transition-all">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Choose PDF File
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-sm text-gray-400 mt-4">PDF files only</p>
            </div>
          </div>
        </div>
      )}

      {/* PDF */}
      {pdfFile && (
        <div className="relative mt-4 w-full max-w-5xl">
          {/* Top Bar */}
          <div className="mb-4 bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-gray-800">PDF Document</p>
                <p className="text-sm text-gray-500">{numPages} {numPages === 1 ? 'page' : 'pages'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowSigModal(true);
                  setLockSignature(false);
                }}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Add Signature
              </button>
              <button
                onClick={saveSignedPdf}
                disabled={!signature || !lockSignature}
                className={`px-5 py-2.5 rounded-lg font-medium shadow-md transition-all flex items-center gap-2 ${
                  signature && lockSignature
                    ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Signed PDF
              </button>
            </div>
          </div>

          {/* Instructions */}
          {!signature && (
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How to sign your PDF:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Click "Add Signature" to create your signature</li>
                  <li>Click anywhere on the PDF to place it</li>
                  <li>Drag to adjust position, then click "Place Signature"</li>
                  <li>Click "Download Signed PDF" when ready</li>
                </ol>
              </div>
            </div>
          )}

          {/* PDF Canvas */}
          <div
            ref={pdfRef}
            onClick={handlePdfClick}
            className={`relative bg-white rounded-xl shadow-2xl p-4 ${
              signature && !lockSignature ? "cursor-crosshair" : "cursor-default"
            }`}
          >
            {signature && !lockSignature && (
              <div className="absolute top-2 left-2 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-1.5 rounded-lg text-sm font-medium z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                Click on the PDF to position your signature
              </div>
            )}
            <Document
              file={pdfFile}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(error) => {
                console.error("PDF load error:", error);
                alert("Failed to load PDF. Please try again.");
              }}
            >
              <Page
                pageNumber={1}
                width={800}
                onLoadSuccess={(page) =>
                  setPageSize({ width: page.width, height: page.height })
                }
                onRenderError={(error) => {
                  console.error("PDF render error:", error);
                }}
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>

            {/* Signature */}
            {signature && (
              <DraggableSignature
                image={signature.image}
                x={signature.x}
                y={signature.y}
                locked={lockSignature}
                onMove={(x, y) => setSignature({ ...signature, x, y })}
                onLock={() => setLockSignature(true)}
              />
            )}
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSigModal && (
        <SignaturePad
          onSave={(img) => {
            console.log("Signature saved, image data length:", img?.length);
            if (img) {
              setSignature({ image: img, x: 50, y: 50 });
              setShowSigModal(false);
            } else {
              alert("Failed to save signature. Please try again.");
            }
          }}
          onClose={() => {
            setShowSigModal(false);
          }}
        />
      )}
    </div>
  );
}
