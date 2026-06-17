// src/components/ImageNode.tsx

import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";

const ImageNode = ({ node, editor, getPos }: NodeViewProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutate: deleteImage } = useApiMutation("delete");

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

  return (
    <NodeViewWrapper>
      <div className="group relative" draggable>
        <div
          className="relative my-4 inline-block max-h-[500px] max-w-full cursor-move"
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
            className="pointer-events-none max-h-[500px] max-w-full rounded-lg"
          />

          {isDeleting && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-900 bg-opacity-75">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
              <span className="ml-2 text-white">در حال حذف...</span>
            </div>
          )}
        </div>

        {/* Delete button */}
        {!isDeleting && (
          <div className="absolute right-2 top-6 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md bg-red-600 p-1 hover:bg-red-700"
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
