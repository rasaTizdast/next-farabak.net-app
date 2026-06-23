// src/components/ImageNode.tsx

import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Trash2, Maximize2, Minimize2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

import { useApiMutation } from "@/hooks/useApiMutation";

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

const ImageNode = ({ node, editor, getPos, updateAttributes }: NodeViewProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: deleteImage } = useApiMutation("delete");
  const [showResizeOptions, setShowResizeOptions] = useState(false);
  const [customWidth, setCustomWidth] = useState(() => DEFAULT_WIDTH.toString());
  const [customHeight, setCustomHeight] = useState(() => DEFAULT_HEIGHT.toString());
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

    const key = node.attrs.src;
    const result = await deleteImage("/api/manageBlog/delete", { key });

    if (result) {
      const pos = getPos();
      editor.commands.deleteRange({ from: pos, to: pos + 1 });
    } else {
      alert("Failed to delete image");
    }
    setIsDeleting(false);
  };

  const handleResize = (preset: string) => {
    // Use safe values to make sure we have valid dimensions
    let newWidth = safeWidth;
    let newHeight = safeHeight;

    // Calculate aspect ratio from safe values, with fallback
    const aspectRatio = safeHeight > 0 ? safeWidth / safeHeight : DEFAULT_WIDTH / DEFAULT_HEIGHT;

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
  const handleResizeStart = (e: React.MouseEvent) => {
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
      const newWidth = Math.max(100, startDimensions.width + deltaX);

      // Calculate height based on aspect ratio
      const newHeight = Math.round(newWidth / aspectRatio);

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
      <div className="group relative" draggable={!isResizing}>
        <div
          ref={imageRef}
          className={`relative my-4 inline-block max-w-full cursor-move ${
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
            className="pointer-events-none max-h-[500px] max-w-full rounded-lg"
          />

          {isDeleting && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-900 bg-opacity-75">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
              <span className="mr-2 text-white">در حال حذف...</span>
            </div>
          )}

          {/* Resize handles */}
          {!isDeleting && (
            <>
              {/* Bottom-right resize handle */}
              <div
                className="absolute bottom-0 right-0 z-10 flex h-6 w-6 cursor-se-resize items-center justify-center rounded-tl bg-blue-600 opacity-0 group-hover:opacity-70"
                onMouseDown={(e) => handleResizeStart(e)}
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
                className="absolute bottom-0 left-0 z-10 flex h-6 w-6 cursor-sw-resize items-center justify-center rounded-tr bg-blue-600 opacity-0 group-hover:opacity-70"
                onMouseDown={(e) => handleResizeStart(e)}
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
                <div className="absolute left-0 top-0 z-20 rounded-br bg-blue-600 px-2 py-1 text-xs text-white">
                  {customWidth} × {customHeight}
                </div>
              )}
            </>
          )}
        </div>

        {/* Controls overlay */}
        <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {/* Resize button */}
          <button
            onClick={toggleResizeOptions}
            className="rounded-md bg-blue-600 p-1 text-white hover:bg-blue-700"
            title="تغییر اندازه"
            aria-label="تغییر اندازه"
            type="button"
          >
            {showResizeOptions ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>

          {/* Delete button */}
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md bg-red-600 p-1 text-white hover:bg-red-700"
            disabled={isDeleting}
            title="حذف تصویر"
            aria-label="حذف تصویر"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Resize options panel */}
        {showResizeOptions && (
          <div className="absolute right-2 top-12 z-10 rounded-md border border-gray-600 bg-gray-800 p-3 text-white shadow-lg">
            <div className="mb-2 text-right font-bold">تغییر اندازه تصویر</div>

            <div className="mb-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleResize("full")}
                className={`rounded-md px-3 py-1 text-right ${
                  attrs.size === "full" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                عرض کامل صفحه
              </button>
              <button
                type="button"
                onClick={() => handleResize("half")}
                className={`rounded-md px-3 py-1 text-right ${
                  attrs.size === "half" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                نصف عرض صفحه
              </button>
              <button
                type="button"
                onClick={() => handleResize("third")}
                className={`rounded-md px-3 py-1 text-right ${
                  attrs.size === "third" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                یک سوم عرض صفحه
              </button>
            </div>

            <div className="mb-2 rounded bg-blue-600 p-1 text-center text-xs text-white">
              برای تغییر اندازه مستقیم، گوشه های تصویر را بکشید
            </div>

            <div className="mb-2 border-t border-gray-600 pt-2">
              <div className="mb-1 text-right text-sm">اندازه سفارشی:</div>
              <div className="flex items-center gap-2">
                <div>
                  <label className="block text-right text-xs text-gray-400">عرض (پیکسل)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(e.target.value)}
                    className="w-20 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-right"
                    min="100"
                  />
                </div>
                <div>
                  <label className="block text-right text-xs text-gray-400">ارتفاع (پیکسل)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(e.target.value)}
                    className="w-20 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-right"
                    min="100"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={applyCustomSize}
                className="mt-2 w-full rounded-md bg-green-600 px-3 py-1 text-right hover:bg-green-700"
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
