// src/components/TipTapBlogEditor.tsx

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { useState, useCallback, useEffect } from "react";
import {
  Bold,
  Italic,
  Link2,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Code,
  Pilcrow,
  Heading4,
  Heading5,
  Heading6,
} from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import { Divider } from "./Divider";
import { CustomImage } from "./Image";

interface TipTapBlogEditorProps {
  onSave?: (content: string, status: boolean) => void;
  blogData?: string; // Add prop for initial content
  slug: string;
}

const TipTapBlogEditor = ({
  onSave,
  blogData,
  slug,
}: TipTapBlogEditorProps) => {
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);

  const calculateDimensions = async (url: string) => {
    if (typeof window === "undefined") {
      return { width: 0, height: 0 }; // Fallback for server-side
    }

    return new Promise<{ width: number; height: number }>((resolve) => {
      const img = new window.Image(); // Use window.Image for browser compatibility
      img.src = url;

      img.onload = () => {
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 800;
        let { width, height } = img;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        resolve({ width, height });
      };

      img.onerror = () => {
        console.error("Failed to load image");
        resolve({ width: 0, height: 0 }); // Fallback dimensions
      };
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] }, // Allow all heading levels
        codeBlock: {
          HTMLAttributes: { class: "p-4 rounded bg-gray-800 relative" },
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full my-4" },
      }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      // Replace the existing ResizableImage configuration in the editor setup
      CustomImage,
    ],
    content: blogData || "", // Initialize with blogData if provided
  });

  // Update editor content when blogData changes
  useEffect(() => {
    if (editor && blogData) {
      editor.commands.setContent(blogData);
    }
  }, [editor, blogData]);

  const addImage = useCallback(
    async (file: File) => {
      if (!editor || file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }

      try {
        setIsImageLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("slug", slug);

        const response = await fetch("/api/manageBlog/upload", {
          method: "POST",
          body: formData,
        });

        const { url } = await response.json();
        const { width, height } = await calculateDimensions(url);

        // Remove temporary placeholder
        editor.commands.command(({ chain }) => {
          return chain()
            .focus()
            .deleteRange({
              from: editor.state.selection.from - 1,
              to: editor.state.selection.from,
            })
            .insertContent({
              type: "image",
              attrs: {
                src: url,
                alt: file.name,
                title: file.name,
                width,
                height,
                slug, // Add the slug here
              },
            })
            .run();
        });
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload image");
      } finally {
        setIsImageLoading(false);
      }
    },
    [editor, slug] // Add slug to dependencies
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        addImage(file);
      }
    },
    [addImage]
  );

  // Change the handlePaste type definition
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      const file = event.clipboardData?.files[0];
      if (file && file.type.startsWith("image/")) {
        addImage(file);
      }
    },
    [addImage]
  );

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkUrl("");
    setIsLinkMenuOpen(false);
  }, [editor, linkUrl]);

  const exportToMDX = useCallback(
    (status: boolean) => {
      if (!editor) return;

      // Convert editor content to MDX
      let mdxContent = editor
        .getHTML()
        // Convert img tags to Next.js Image components
        .replace(
          /<img\s+src="([^"]+)"\s+alt="([^"]+)"[^>]*width="([^"]+)"[^>]*height="([^"]+)"[^>]*>/g,
          '<Image\n  src="$1"\n  alt="$2"\n  width={$3}\n  height={$4}\n  layout="responsive"\n/>'
        );

      // Add Image import at the top
      // mdxContent = `import Image from 'next/image';\n\n${mdxContent}`;
      onSave?.(mdxContent, status);
    },
    [editor, onSave]
  );

  // Improved editor container styling
  const editorContainerClasses = `
  flex-1 overflow-y-auto
  p-4 focus:outline-none 
  prose prose-invert max-w-none 
  [&_img]:max-w-[600px] [&_img]:h-[500px]
  [&_.tiptap]:outline-none [&_.tiptap]:p-2
  [&_.tiptap]:min-h-[300px]
  [&_.tiptap]:h-full
  [&_.tiptap]:overflow-y-auto
  [&_.tiptap]:pb-8
  [&_.tiptap-placeholder]:before:text-gray-500
  [&_.tiptap-heading]:text-gray-100
  [&_ul]:list-disc [&_ol]:list-decimal
  [&_blockquote]:border-l-4 [&_blockquote]:border-gray-500 
  [&_blockquote]:pl-4 [&_blockquote]:my-4 [&_blockquote]:italic 
  [&_pre]:bg-gray-700 [&_pre]:p-4 [&_pre]:rounded [&_pre]:my-4
  [&_code]:bg-gray-700 [&_code]:px-2 [&_code]:py-1 [&_code]:rounded
  [&_div[data-loading-image]]:relative
  [&_div[data-loading-image]]:animate-pulse
  [&_div[data-loading-image]]:bg-gray-700
  [&_div[data-loading-image]]:h-48
  [&_div[data-loading-image]]:rounded-lg
  [&_div[data-loading-image]]:my-4`;

  if (!editor) return null;

  return (
    <div
      className="relative border border-gray-600 rounded-lg bg-gray-800 text-gray-100 flex flex-col min-h-[500px]"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
    >
      {/* Fixed Toolbar */}
      <div className="sticky top-0 z-20 bg-gray-800 p-2 border-b border-gray-600 rounded-t-lg shadow-lg">
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              icon={Redo}
              title="Undo"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              icon={Undo}
              title="Redo"
            />
            <Divider />
            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              active={editor.isActive("paragraph")}
              icon={Pilcrow}
              title="Paragraph"
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              active={editor.isActive("heading", { level: 1 })}
              icon={Heading1}
              title="Heading 1"
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              active={editor.isActive("heading", { level: 2 })}
              icon={Heading2}
              title="Heading 2"
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              active={editor.isActive("heading", { level: 3 })}
              icon={Heading3}
              title="Heading 3"
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()
              }
              active={editor.isActive("heading", { level: 4 })}
              icon={Heading4}
              title="Heading 4"
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 5 }).run()
              }
              active={editor.isActive("heading", { level: 5 })}
              icon={Heading5}
              title="Heading 5"
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 6 }).run()
              }
              active={editor.isActive("heading", { level: 6 })}
              icon={Heading6}
              title="Heading 6"
            />
            <Divider />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive("bold")}
              icon={Bold}
              title="Bold"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive("italic")}
              icon={Italic}
              title="Italic"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive("code")}
              icon={Code}
              title="Code"
            />
            <Divider />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive("bulletList")}
              icon={List}
              title="Bullet List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive("orderedList")}
              icon={ListOrdered}
              title="Numbered List"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive("blockquote")}
              icon={Quote}
              title="Blockquote"
            />
            <Divider />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              active={editor.isActive({ textAlign: "right" })}
              icon={AlignRight}
              title="Align Right"
            />
            <ToolbarButton
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              active={editor.isActive({ textAlign: "center" })}
              icon={AlignCenter}
              title="Align Center"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              active={editor.isActive({ textAlign: "left" })}
              icon={AlignLeft}
              title="Align Left"
            />
            <Divider />
            <ToolbarButton
              onClick={() => setIsLinkMenuOpen(!isLinkMenuOpen)}
              active={editor.isActive("link")}
              icon={Link2}
              title="Link"
            />
            <label className="p-2 hover:bg-gray-600 rounded-md cursor-pointer text-gray-300">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addImage(file);
                }}
              />
              <ImageIcon className="w-5 h-5" />
            </label>
            {isImageLoading && (
              <div className="ml-2 flex items-center gap-2 text-sm text-gray-400">
                <Divider />
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                در حال آپلود عکس...
              </div>
            )}
          </div>

          {isLinkMenuOpen && (
            <div className="ml-2 flex items-center gap-2">
              <Divider />
              <input
                type="url"
                placeholder="Paste URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && setLink()}
              />
              <button
                onClick={setLink}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Improved Editor Content Area */}
      <div className={editorContainerClasses}>
        <EditorContent
          editor={editor}
          className="focus:ring-2 focus:ring-blue-500 rounded-lg transition-all h-full"
        />
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 flex gap-2 p-4 bg-gray-800 border-t border-gray-600 rounded-b-lg">
        <button
          onClick={() => exportToMDX(false)}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          ذخیره پیش‌نویس مقاله
        </button>
        <button
          onClick={() => exportToMDX(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          ذخیره و انتشار مقاله
        </button>
      </div>

      {/* Bubble Menu (for text formatting) */}
      {editor && (
        <BubbleMenu
          className="flex items-center gap-1 p-2 bg-gray-700 border border-gray-600 rounded-lg shadow-xl"
          tippyOptions={{ duration: 100 }}
          editor={editor}
        >
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            icon={Bold}
            title="Bold"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            icon={Italic}
            title="Italic"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            icon={Code}
            title="Code"
          />
          <ToolbarButton
            onClick={() => setIsLinkMenuOpen(true)}
            active={editor.isActive("link")}
            icon={Link2}
            title="Link"
          />
        </BubbleMenu>
      )}
    </div>
  );
};

export default TipTapBlogEditor;
