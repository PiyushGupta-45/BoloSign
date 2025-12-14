import { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function SignaturePad({ onSave, onClose }) {
  const sigPadRef = useRef(null);
  const canvasRef = useRef(null);
  const [mode, setMode] = useState("draw");
  const [typedName, setTypedName] = useState("");
  
  // Get the actual canvas element after component mounts
  useEffect(() => {
    if (sigPadRef.current) {
      // Try to find the canvas element
      const findCanvas = () => {
        if (sigPadRef.current) {
          // Try different ways to access the canvas
          if (sigPadRef.current.getCanvas) {
            canvasRef.current = sigPadRef.current.getCanvas();
          } else if (sigPadRef.current.canvas) {
            canvasRef.current = sigPadRef.current.canvas;
          } else if (sigPadRef.current._canvas) {
            canvasRef.current = sigPadRef.current._canvas;
          } else {
            // Try to find it in the DOM
            const canvasEl = document.querySelector('.signature-canvas canvas');
            if (canvasEl) {
              canvasRef.current = canvasEl;
            }
          }
        }
      };
      
      // Try immediately and after a short delay
      findCanvas();
      const timeout = setTimeout(findCanvas, 100);
      return () => clearTimeout(timeout);
    }
  }, [mode]);

  const generateTypedSignature = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 150;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "48px 'Pacifico', cursive";
    ctx.fillStyle = "black";
    ctx.fillText(typedName, 20, 90);

    return canvas.toDataURL("image/png");
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-[480px] max-w-[90vw] animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Create Signature</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-200 ${
                mode === "draw" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setMode("draw")}
            >
              ✏️ Draw
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition-all duration-200 ${
                mode === "type" 
                  ? "bg-white text-blue-600 shadow-sm" 
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => setMode("type")}
            >
              ⌨️ Type
            </button>
          </div>

          {/* Draw Mode */}
          {mode === "draw" && (
            <div>
              <div className="signature-canvas bg-white rounded-lg border-2 border-gray-200 shadow-inner overflow-hidden">
                <SignatureCanvas
                  ref={sigPadRef}
                  penColor="#1f2937"
                  backgroundColor="white"
                  canvasProps={{
                    width: 440,
                    height: 180,
                    className: "w-full",
                  }}
                />
              </div>
              <button
                type="button"
                className="mt-3 text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (sigPadRef.current) {
                    sigPadRef.current.clear();
                  }
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Canvas
              </button>
            </div>
          )}

          {/* Type Mode */}
          {mode === "type" && (
            <div>
              <input
                type="text"
                placeholder="Enter your name here..."
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-xl font-semibold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">Your name will be converted to a signature</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              try {
                if (mode === "draw") {
                  if (!sigPadRef.current) {
                    alert("Signature canvas not initialized. Please try again.");
                    return;
                  }
                  
                  // Check if signature is empty
                  const isEmpty = sigPadRef.current.isEmpty ? sigPadRef.current.isEmpty() : false;
                  if (isEmpty) {
                    alert("Please draw a signature first");
                    return;
                  }
                  
                  // Try to get canvas - use cached ref first, then try other methods
                  let canvas = canvasRef.current;
                  
                  if (!canvas) {
                    // Try different methods to access canvas
                    if (sigPadRef.current.getCanvas) {
                      canvas = sigPadRef.current.getCanvas();
                    } else if (sigPadRef.current.canvas) {
                      canvas = sigPadRef.current.canvas;
                    } else if (sigPadRef.current._canvas) {
                      canvas = sigPadRef.current._canvas;
                    } else {
                      // Find canvas in DOM
                      const canvasEl = document.querySelector('.signature-canvas canvas');
                      if (canvasEl) {
                        canvas = canvasEl;
                      }
                    }
                  }
                  
                  if (!canvas) {
                    // Last resort: try toDataURL method directly
                    if (typeof sigPadRef.current.toDataURL === 'function') {
                      const dataUrl = sigPadRef.current.toDataURL("image/png");
                      if (dataUrl && dataUrl !== "data:,") {
                        onSave(dataUrl);
                        return;
                      }
                    }
                    alert("Failed to access signature canvas. Please try drawing again.");
                    return;
                  }
                  
                  // Get the image data from canvas
                  const dataUrl = canvas.toDataURL("image/png");
                  if (!dataUrl || dataUrl === "data:,") {
                    alert("Failed to generate signature image. Please try drawing again.");
                    return;
                  }
                  
                  onSave(dataUrl);
                } else {
                  if (!typedName.trim()) {
                    alert("Please enter your name");
                    return;
                  }
                  const typedSig = generateTypedSignature();
                  onSave(typedSig);
                }
              } catch (error) {
                console.error("Error saving signature:", error);
                console.error("Signature ref:", sigPadRef.current);
                alert(`Failed to save signature: ${error.message}`);
              }
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Signature
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
