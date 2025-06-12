import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface VideoAttributes {
  src: string;
  title: string;
  slug: string;
}

const VideoNode = ({
  node,
  editor,
  getPos,
  updateAttributes,
}: NodeViewProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const attrs = node.attrs as VideoAttributes;

  const handleDelete = async () => {
    const confirmed = window.confirm("آیا میخواهید این ویدیو حذف شود؟");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const key = node.attrs.src;

      await fetch("/api/products/productBlog/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      const pos = getPos();
      editor.commands.deleteRange({ from: pos, to: pos + 1 });
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  };

  const isExternalUrl = (url: string): boolean => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

  const getVideoUrl = (src: string): string => {
    if (isExternalUrl(src)) return src;
    
    const bucketUrl = process.env.NEXT_PUBLIC_LIARA_BUCKET_URL;
    return `${bucketUrl}/${src}`;
  };

  return (
    <NodeViewWrapper className="relative group w-full my-8 mx-auto max-w-4xl">
      <div className="bg-gray-800 p-3 rounded-lg shadow-md">
        <div className="relative aspect-video">
          <video
            src={getVideoUrl(attrs.src)}
            title={attrs.title}
            controls
            className="w-full h-full rounded-md"
          />
        </div>
        
        <div className="flex justify-end mt-2 space-x-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete video"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default VideoNode; 