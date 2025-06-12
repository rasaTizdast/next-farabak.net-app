// src/components/ImageNode.tsx

import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import Image from "next/image";
import { Trash2, Maximize2, Minimize2, MousePointer } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ImageAttributes {
  src: string;
  alt: string;
  width: number;
  height: number;
  slug: string;
  size?: string; // New attribute for size presets
}

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 400;

const ImageNode = ({
  node,
  editor,
  getPos,
  updateAttributes,
}: NodeViewProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResizeOptions, setShowResizeOptions] = useState(false);
  const [customWidth, setCustomWidth] = useState(DEFAULT_WIDTH.toString());
  const [customHeight, setCustomHeight] = useState(DEFAULT_HEIGHT.toString());
  const [isResizing, setIsResizing] = useState(false);
  const [startResizePos, setStartResizePos] = useState({ x: 0, y: 0 });
  const [startDimensions, setStartDimensions] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });
  const imageRef = useRef<HTMLDivElement>(null);

  const attrs = node.attrs as ImageAttributes;

  // Ensure width and height are valid numbers with fallbacks
  const safeWidth =
    typeof attrs.width === "number" && !isNaN(attrs.width) && attrs.width > 0
      ? attrs.width
      : DEFAULT_WIDTH;

  const safeHeight =
    typeof attrs.height === "number" && !isNaN(attrs.height) && attrs.height > 0
      ? attrs.height
      : DEFAULT_HEIGHT;

  // Initialize dimension values
  useEffect(() => {
    // Set default values on mount
    setCustomWidth(safeWidth.toString());
    setCustomHeight(safeHeight.toString());

    // Update attributes if they're invalid
    if (attrs.width !== safeWidth || attrs.height !== safeHeight) {
      updateAttributes({
        width: safeWidth,
        height: safeHeight,
        size: attrs.size || "full",
      });
    }
  }, []);

  // Update form values when attributes change
  useEffect(() => {
    // Only update when we have valid dimensions
    if (safeWidth > 0 && safeHeight > 0) {
      setCustomWidth(safeWidth.toString());
      setCustomHeight(safeHeight.toString());
    }
  }, [safeWidth, safeHeight]);

  useEffect(() => {
    // Add resize event handlers when resizing
    if (isResizing) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);

      // Prevent text selection during resize
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
        document.body.style.userSelect = "";
      };
    }
  }, [isResizing]);

  const handleDelete = async () => {
    const confirmed = window.confirm("آیا میخواهید این عکس حذف شود؟");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const key = node.attrs.src;

      await fetch("/api/manageBlog/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const pos = getPos();
      editor.commands.deleteRange({ from: pos, to: pos + 1 });
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete image");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResize = (preset: string) => {
    // Use safe values to make sure we have valid dimensions
    let newWidth = safeWidth;
    let newHeight = safeHeight;

    // Calculate aspect ratio from safe values, with fallback
    const aspectRatio =
      safeHeight > 0 ? safeWidth / safeHeight : DEFAULT_WIDTH / DEFAULT_HEIGHT;

    // Calculate new dimensions based on preset
    try {
      switch (preset) {
        case "full":
          newWidth = 1000; // Max width for full page
          newHeight = Math.round(newWidth / aspectRatio);
          break;
        case "half":
          newWidth = 500; // Half page width
          newHeight = Math.round(newWidth / aspectRatio);
          break;
        case "third":
          newWidth = 333; // Third of page width
          newHeight = Math.round(newWidth / aspectRatio);
          break;
        case "custom":
          // Use the current input values
          newWidth = parseInt(customWidth) || DEFAULT_WIDTH;
          newHeight = parseInt(customHeight) || DEFAULT_HEIGHT;
          break;
        default:
          newWidth = DEFAULT_WIDTH;
          newHeight = DEFAULT_HEIGHT;
      }
    } catch (e) {
      console.error("Error calculating dimensions:", e);
      newWidth = DEFAULT_WIDTH;
      newHeight = DEFAULT_HEIGHT;
    }

    // Final validation - use defaults if calculations failed
    if (isNaN(newWidth) || newWidth <= 0) newWidth = DEFAULT_WIDTH;
    if (isNaN(newHeight) || newHeight <= 0) newHeight = DEFAULT_HEIGHT;

    // Apply changes to the editor
    updateAttributes({
      width: newWidth,
      height: newHeight,
      size: preset,
    });

    // Update the form fields to match
    setCustomWidth(newWidth.toString());
    setCustomHeight(newHeight.toString());

    // Update the visual display immediately
    if (imageRef.current) {
      imageRef.current.style.width = `${newWidth}px`;
    }
  };

  const applyCustomSize = () => {
    // Parse input values with fallbacks
    let newWidth = parseInt(customWidth);
    let newHeight = parseInt(customHeight);

    // Validate input values
    if (isNaN(newWidth) || newWidth <= 0) {
      newWidth = DEFAULT_WIDTH;
      setCustomWidth(DEFAULT_WIDTH.toString());
    }

    if (isNaN(newHeight) || newHeight <= 0) {
      newHeight = DEFAULT_HEIGHT;
      setCustomHeight(DEFAULT_HEIGHT.toString());
    }

    // Update attributes
    updateAttributes({
      width: newWidth,
      height: newHeight,
      size: "custom",
    });

    // Update the visual display immediately
    if (imageRef.current) {
      imageRef.current.style.width = `${newWidth}px`;
    }
  };

  const toggleResizeOptions = () => {
    setShowResizeOptions(!showResizeOptions);
  };

  // Handle the start of resize operation
  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Make sure we start with valid dimensions
    const startWidth = safeWidth;
    const startHeight = safeHeight;

    setIsResizing(true);
    setStartResizePos({ x: e.clientX, y: e.clientY });
    setStartDimensions({ width: startWidth, height: startHeight });

    // Ensure the custom values are set correctly from the start
    setCustomWidth(startWidth.toString());
    setCustomHeight(startHeight.toString());
  };

  // Handle mouse movement during resize
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;

    try {
      const deltaX = e.clientX - startResizePos.x;

      // Ensure we have a valid aspect ratio to work with
      const aspectRatio =
        startDimensions.height > 0
          ? startDimensions.width / startDimensions.height
          : DEFAULT_WIDTH / DEFAULT_HEIGHT;

      // Calculate new width with a minimum size
      let newWidth = Math.max(100, startDimensions.width + deltaX);

      // Calculate height based on aspect ratio
      let newHeight = Math.round(newWidth / aspectRatio);

      // Update form values and visual feedback
      setCustomWidth(newWidth.toString());
      setCustomHeight(newHeight.toString());

      // Update the image size in real-time for visual feedback
      if (imageRef.current) {
        imageRef.current.style.width = `${newWidth}px`;
      }
    } catch (error) {
      console.error("Error during resize:", error);
      // Don't interrupt the resize operation, but log the error
    }
  };

  // Handle the end of resize operation
  const handleResizeEnd = () => {
    setIsResizing(false);

    // Get final dimensions from the form
    let newWidth = parseInt(customWidth);
    let newHeight = parseInt(customHeight);

    // Final validation with fallbacks
    if (isNaN(newWidth) || newWidth <= 0) newWidth = DEFAULT_WIDTH;
    if (isNaN(newHeight) || newHeight <= 0) newHeight = DEFAULT_HEIGHT;

    // Apply changes
    updateAttributes({
      width: newWidth,
      height: newHeight,
      size: "custom",
    });
  };

  return (
    <NodeViewWrapper>
      <div className="relative group" draggable={!isResizing}>
        <div
          ref={imageRef}
          className={`relative inline-block max-w-full cursor-move my-4 ${
            isResizing ? "border-2 border-blue-500" : ""
          }`}
          data-drag-handle
          style={
            {
              maxHeight: "500px",
              width: `${safeWidth}px`, // Set explicit width for proper initial display
              "--img-width": `${safeWidth}px`,
            } as React.CSSProperties
          }
        >
          <Image
            src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${node.attrs.src}`}
            alt={node.attrs.alt || "Image"}
            width={safeWidth}
            height={safeHeight}
            layout="responsive"
            objectFit="contain"
            className="rounded-lg pointer-events-none max-w-full max-h-[500px]"
          />

          {isDeleting && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-white mr-2">در حال حذف...</span>
            </div>
          )}

          {/* Resize handles */}
          {!isDeleting && (
            <>
              {/* Bottom-right resize handle */}
              <div
                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 opacity-0 group-hover:opacity-70 rounded-tl cursor-se-resize z-10 flex items-center justify-center"
                onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="white">
                  <path
                    d="M0 0 L10 10 M5 10 L10 10 L10 5"
                    strokeWidth="1"
                    stroke="white"
                    fillOpacity="0"
                  />
                </svg>
              </div>

              {/* Bottom-left resize handle */}
              <div
                className="absolute bottom-0 left-0 w-6 h-6 bg-blue-600 opacity-0 group-hover:opacity-70 rounded-tr cursor-sw-resize z-10 flex items-center justify-center"
                onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="white"
                  style={{ transform: "scaleX(-1)" }}
                >
                  <path
                    d="M0 0 L10 10 M5 10 L10 10 L10 5"
                    strokeWidth="1"
                    stroke="white"
                    fillOpacity="0"
                  />
                </svg>
              </div>

              {/* Size indicator that appears when resizing */}
              {isResizing && (
                <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-2 py-1 rounded-br z-20">
                  {customWidth} × {customHeight}
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls overlay */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Resize button */}
          <button
            onClick={toggleResizeOptions}
            className="p-1 bg-blue-600 rounded-md hover:bg-blue-700 text-white"
            title="تغییر اندازه"
            type="button"
          >
            {showResizeOptions ? (
              <Minimize2 size={20} />
            ) : (
              <Maximize2 size={20} />
            )}
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={handleDelete}
            className="p-1 bg-red-600 rounded-md hover:bg-red-700 text-white"
            disabled={isDeleting}
            title="حذف تصویر"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Resize options panel */}
        {showResizeOptions && (
          <div className="absolute top-12 right-2 bg-gray-800 border border-gray-600 rounded-md p-3 shadow-lg z-10 text-white">
            <div className="text-right mb-2 font-bold">تغییر اندازه تصویر</div>

            <div className="flex flex-col gap-2 mb-3">
              <button
                onClick={() => handleResize("full")}
                className={`px-3 py-1 rounded-md text-right ${
                  attrs.size === "full"
                    ? "bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                عرض کامل صفحه
              </button>
              <button
                onClick={() => handleResize("half")}
                className={`px-3 py-1 rounded-md text-right ${
                  attrs.size === "half"
                    ? "bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                نصف عرض صفحه
              </button>
              <button
                onClick={() => handleResize("third")}
                className={`px-3 py-1 rounded-md text-right ${
                  attrs.size === "third"
                    ? "bg-blue-600"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                یک سوم عرض صفحه
              </button>
            </div>

            <div className="text-center bg-blue-600 text-white text-xs p-1 rounded mb-2">
              برای تغییر اندازه مستقیم، گوشه های تصویر را بکشید
            </div>

            <div className="border-t border-gray-600 pt-2 mb-2">
              <div className="text-right mb-1 text-sm">اندازه سفارشی:</div>
              <div className="flex gap-2 items-center">
                <div>
                  <label className="text-xs text-gray-400 block text-right">
                    عرض (پیکسل)
                  </label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right"
                    min="100"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block text-right">
                    ارتفاع (پیکسل)
                  </label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded text-right"
                    min="100"
                  />
                </div>
              </div>
              <button
                onClick={applyCustomSize}
                className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded-md w-full text-right"
              >
                اعمال اندازه سفارشی
              </button>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageNode;
