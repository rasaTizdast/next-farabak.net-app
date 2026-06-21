import { NodeViewProps, NodeViewWrapper } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";

import { useApiMutation } from "@/hooks/useApiMutation";

interface VideoAttributes {
  src: string;
  title: string;
  slug: string;
}

const VideoNode = ({ node, editor, getPos }: NodeViewProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const attrs = node.attrs as VideoAttributes;
  const { mutate: deleteVideo } = useApiMutation("delete");

  const handleDelete = async () => {
    const confirmed = window.confirm("آیا میخواهید این ویدیو حذف شود؟");
    if (!confirmed) return;

    setIsDeleting(true);

    const key = node.attrs.src;
    const result = await deleteVideo("/api/products/productBlog/delete", { key });

    if (result) {
      const pos = getPos();
      editor.commands.deleteRange({ from: pos, to: pos + 1 });
    } else {
      alert("Failed to delete video");
    }
    setIsDeleting(false);
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
    <NodeViewWrapper className="group relative mx-auto my-8 w-full max-w-4xl">
      <div className="rounded-lg bg-gray-800 p-3 shadow-md">
        <div className="relative aspect-video">
          <video
            src={getVideoUrl(attrs.src)}
            title={attrs.title}
            controls
            className="h-full w-full rounded-md"
          />
        </div>

        <div className="mt-2 flex justify-end space-x-2">
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
            title="حذف ویدیو"
            aria-label="حذف ویدیو"
            type="button"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default VideoNode;
