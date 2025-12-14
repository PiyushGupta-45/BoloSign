import { useState, useEffect, useRef } from "react";

export default function DraggableSignature({
    image,
    x,
    y,
    locked,
    onMove,
    onLock,
}) {
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    const handleMouseDown = (e) => {
        if (locked) return;
        e.preventDefault();
        e.stopPropagation();
        const rect = containerRef.current.getBoundingClientRect();
        setDragStart({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        setDragging(true);
    };

    useEffect(() => {
        if (!dragging) return;

        const handleMouseMove = (e) => {
            if (locked) return;
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const newX = e.clientX - rect.left - dragStart.x;
            const newY = e.clientY - rect.top - dragStart.y;

            onMove(newX, newY);
        };

        const handleMouseUp = () => {
            setDragging(false);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging, locked, dragStart, onMove]);

    return (
        <div
            ref={containerRef}
            style={{
                position: "absolute",
                left: x,
                top: y,
                cursor: locked ? "default" : "grab",
                zIndex: 20,
            }}
            className={locked ? "" : "transition-transform hover:scale-105"}
        >
            <div className="relative">
                <img
                    src={image}
                    alt="signature"
                    className={`bg-white rounded-lg shadow-lg ${
                        locked 
                            ? "border-2 border-green-500" 
                            : "border-2 border-blue-500 border-dashed"
                    }`}
                    width={150}
                    height={60}
                    onMouseDown={handleMouseDown}
                    draggable={false}
                />
                {!locked && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    </div>
                )}
                {locked && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
            </div>

            {!locked && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onLock();
                    }}
                    className="absolute -bottom-10 left-0 text-xs bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-lg z-30 font-medium flex items-center gap-1.5 transition-all hover:scale-105"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Place Signature
                </button>
            )}
            {locked && (
                <div className="absolute -bottom-10 left-0 text-xs bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-1.5 font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Placed
                </div>
            )}
        </div>
    );
}
