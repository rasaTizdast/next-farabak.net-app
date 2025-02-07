// src/components/ImageNode.tsx

import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface ImageAttributes {
  src: string;
  alt: string;
  width: number;
  height: number;
  slug: string;
}

const ImageNode = ({ node, editor, getPos }: NodeViewProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const attrs = node.attrs as ImageAttributes;

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
  console.log(attrs.src);
  console.log(attrs.slug);
  return (
    <NodeViewWrapper>
      <div className="relative group" draggable>
        <div
          className="relative inline-block max-w-full max-h-[500px] cursor-move my-4"
          data-drag-handle // Add this attribute
        >
          <Image
            // src={node.attrs.src}
            src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${node.attrs.src}`}
            alt={node.attrs.alt}
            width={node.attrs.width}
            height={node.attrs.height}
            layout="responsive"
            objectFit="contain"
            className="rounded-lg pointer-events-none max-w-full max-h-[500px]"
          />

          {isDeleting && (
            <div className="absolute inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="text-white ml-2">در حال حذف...</span>
            </div>
          )}
        </div>

        {/* Delete button */}
        {!isDeleting && (
          <div className="absolute top-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDelete}
              className="p-1 bg-red-600 rounded-md hover:bg-red-700"
              disabled={isDeleting}
            >
              <Trash2 className="text-white" size={20} />
            </button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageNode;
