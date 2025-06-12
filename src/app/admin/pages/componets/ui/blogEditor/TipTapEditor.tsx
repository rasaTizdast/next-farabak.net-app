// src/components/TipTapBlogEditor.tsx

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { useState, useCallback, useEffect, useRef } from "react";
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
  Table as TableIcon,
  FileUp,
  Video,
} from "lucide-react";
import { ToolbarButton } from "./ToolbarButton";
import { Divider } from "./Divider";
import { CustomImage } from "./Image";
import { CustomVideo } from "./Video";
import VideoUploadModal from "./VideoUploadModal";

// Default dimensions for imported images
const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 400;

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
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [isHtmlImportModalOpen, setIsHtmlImportModalOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

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
      TextAlign.configure({
        types: ["heading", "paragraph", "tableCell", "tableHeader"],
      }),
      // Table extensions - complete configuration with RTL support
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "w-full my-4 border-collapse",
          dir: "rtl",
        },
      }),
      TableRow,
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-600 bg-gray-700 p-2 text-right",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-600 p-2 text-right",
        },
      }),
      // Add CustomImage and CustomVideo extensions
      CustomImage,
      CustomVideo.configure({
        HTMLAttributes: { class: "w-full my-4" },
      }),
    ],
    content: blogData || "", // Initialize with blogData if provided
  });

  // Update editor content when blogData changes
  useEffect(() => {
    if (editor && blogData) {
      const htmlContent = convertMDXToHTML(blogData);
      editor.commands.setContent(htmlContent);
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

  // Function to check if a URL is external
  const isExternalUrl = (url: string): boolean => {
    return url.startsWith("http://") || url.startsWith("https://");
  };

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
        // Convert img tags to Next.js Image components with proper sizing
        .replace(
          /<img\s+src="([^"]+)"\s+alt="([^"]+)"[^>]*width="([^"]+)"[^>]*height="([^"]+)"[^>]*data-size="([^"]+)"[^>]*>/g,
          (match, src, alt, width, height, size) => {
            // Define different tailwind classes based on size
            let tailwindClass = "";

            switch (size) {
              case "full":
                tailwindClass = "w-full";
                break;
              case "half":
                tailwindClass = "w-1/2 mx-auto";
                break;
              case "third":
                tailwindClass = "w-1/3 mx-auto";
                break;
              case "custom":
                // For custom sizes, we'll create an inline style
                tailwindClass = `max-w-full`;
                break;
              default:
                tailwindClass = "w-full";
            }

            // For custom sizes, add a style attribute as well
            const styleAttr =
              size === "custom" ? `style="--img-width:${width}px"` : "";

            // Handle external URLs differently
            const imgSrc = isExternalUrl(src) ? src : `${src}`;

            if (isExternalUrl(src)) {
              // For external URLs, use unoptimized Image with domain property
              return `<img src="${imgSrc}" alt="${alt}" width="${width}" height="${height}" className="${tailwindClass}" />`;
            } else {
              return `<Image src="${imgSrc}" alt="${alt}" width={${width}} height={${height}} className="${tailwindClass}" quality={100} layout="responsive" ${styleAttr} />`;
            }
          }
        )

        // Also handle images that don't have data-size attribute
        .replace(
          /<img\s+src="([^"]+)"\s+alt="([^"]+)"[^>]*width="([^"]+)"[^>]*height="([^"]+)"[^>]*>/g,
          (match, src, alt, width, height) => {
            // If this regex matches, it means our first replace didn't catch it (no data-size)
            // Handle external URLs differently
            const imgSrc = isExternalUrl(src) ? src : `${src}`;

            if (isExternalUrl(src)) {
              // For external URLs, use unoptimized Image with domain property
              return `<img src="${imgSrc}" alt="${alt}" width="${width}" height="${height}" className="w-full" />`;
            } else {
              return `<Image src="${imgSrc}" alt="${alt}" width={${width}} height={${height}} className="w-full" quality={100} layout="responsive" />`;
            }
          }
        )

        // Make sure videos have the right src path (keep the relative path)
        .replace(
          /<div data-type="video"[^>]*>([\s\S]*?)<\/div>/g,
          (match) => {
            // Preserve the video element as is - it will be processed on the frontend
            return match;
          }
        )

        // Convert a tags to Next.js Link components
        .replace(
          /<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g,
          '<Link href="$1">$2</Link>'
        );

      // Preserve table structure but add styling classes for MDX
      mdxContent = mdxContent
        .replace(
          /<table[^>]*>/g,
          '<table className="w-full my-4 border-collapse" dir="rtl">'
        )
        .replace(
          /<th[^>]*>/g,
          '<th className="border border-gray-600 bg-gray-700 p-2 text-right">'
        )
        .replace(
          /<td[^>]*>/g,
          '<td className="border border-gray-600 p-2 text-right">'
        );

      onSave?.(mdxContent, status);
    },
    [editor, onSave]
  );

  const convertMDXToHTML = (mdxContent: string) => {
    return (
      mdxContent
        // Convert Next.js Image components to regular img tags with size information
        .replace(
          /<Image\s+src="([^"]+)"\s+alt="([^"]+)"[^>]*width=\{(\d+)\}[^>]*height=\{(\d+)\}[^>]*className="([^"]+)"[^>]*\/?>/g,
          (match, src, alt, width, height, className) => {
            // Determine size preset from className
            let size = "full";
            if (className.includes("w-1/2")) size = "half";
            else if (className.includes("w-1/3")) size = "third";
            else if (!className.includes("w-full")) size = "custom";

            return `<img src="${src}" alt="${alt}" width="${width}" height="${height}" class="rounded-lg max-w-full my-4" data-size="${size}" />`;
          }
        )
        // Handle older format without className
        .replace(
          /<Image\s+src="([^"]+)"\s+alt="([^"]+)"[^>]*width=\{(\d+)\}[^>]*height=\{(\d+)\}[^>]*\/?>/g,
          '<img src="$1" alt="$2" width="$3" height="$4" class="rounded-lg max-w-full my-4" data-size="full" />'
        )
        // Convert Next.js Link components to regular a tags
        .replace(
          /<Link\s+href="([^"]+)">\s*([\s\S]*?)\s*<\/Link>/g,
          '<a href="$1">$2</a>'
        )
        // Convert table with className to plain HTML table
        .replace(/<table className="[^"]*">/g, "<table>")
        .replace(/<th className="[^"]*">/g, "<th>")
        .replace(/<td className="[^"]*">/g, "<td>")
    );
  };

  // Toggle the table creation modal
  const toggleTableModal = () => {
    setIsTableModalOpen(!isTableModalOpen);
  };

  // Insert table function
  const insertTable = useCallback(() => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true })
      .run();

    setIsTableModalOpen(false);
  }, [editor, tableRows, tableCols]);

  // Import HTML function
  const importHtml = useCallback(() => {
    if (!editor || !htmlContent) return;

    // Safely clean and insert HTML at cursor position instead of replacing all content
    try {
      // Pre-process HTML to ensure external image sources are preserved
      const processedHtml = htmlContent.replace(
        /<img\s+src="([^"]+)"([^>]*)>/g,
        (match, src, rest) => {
          // Always preserve the original URL to avoid prefixing with bucket URL

          // Extract existing width and height if available
          const widthMatch = rest.match(/width="([^"]+)"/);
          const heightMatch = rest.match(/height="([^"]+)"/);

          const width = widthMatch ? widthMatch[1] : DEFAULT_WIDTH;
          const height = heightMatch ? heightMatch[1] : DEFAULT_HEIGHT;

          // Add width and height if they're missing
          const widthAttr = widthMatch ? "" : ` width="${DEFAULT_WIDTH}"`;
          const heightAttr = heightMatch ? "" : ` height="${DEFAULT_HEIGHT}"`;

          // Ensure we have data-size attribute to identify imported images
          const dataSize = rest.includes("data-size")
            ? ""
            : ' data-size="full"';

          // Preserve original URL but ensure other attributes are added
          return `<img src="${src}"${rest}${widthAttr}${heightAttr}${dataSize}>`;
        }
      );

      // Insert the processed HTML
      editor.chain().focus().insertContent(processedHtml).run();
      setHtmlContent("");
      setIsHtmlImportModalOpen(false);
    } catch (error) {
      console.error("Failed to import HTML:", error);
      alert("Failed to import HTML. Please check your HTML content.");
    }
  }, [editor, htmlContent]);

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
  [&_div[data-loading-image]]:my-4
  [&_table]:border-collapse [&_table]:w-full 
  [&_th]:border [&_th]:border-gray-600 [&_th]:p-2 [&_th]:bg-gray-700
  [&_td]:border [&_td]:border-gray-600 [&_td]:p-2
  [&_.tableControls]:relative [&_.tableControls]:top-[-30px] [&_.tableControls]:justify-center [&_.tableControls]:z-20 [&_.tableControls]:flex`;

  // Add the addVideo function
  const addVideo = useCallback(
    async (file: File) => {
      if (!editor) {
        return;
      }

      if (file.size > 500 * 1024 * 1024) {
        alert("Video size should be less than 500MB");
        return;
      }

      try {
        setIsVideoLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("slug", slug);

        const response = await fetch("/api/manageBlog/uploadVideo", {
          method: "POST",
          body: formData,
        });

        const { url } = await response.json();

        // Insert the video into the editor
        editor.commands.command(({ chain }) => {
          return chain()
            .focus()
            .setVideo({
              src: url,
              title: file.name,
              slug,
            })
            .run();
        });
      } catch (error) {
        console.error("Video upload failed:", error);
        alert("Failed to upload video");
      } finally {
        setIsVideoLoading(false);
      }
    },
    [editor, slug]
  );

  // Add toggleVideoModal function
  const toggleVideoModal = () => {
    setIsVideoModalOpen(!isVideoModalOpen);
  };

  if (!editor) return null;

  return (
    <div
      className="relative border border-gray-600 rounded-lg bg-gray-800 text-gray-100 flex flex-col min-h-[500px]"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
      ref={editorContainerRef}
    >
      {/* Fixed Toolbar */}
      <div className="sticky -top-6 z-20 bg-gray-800 p-2 border-b border-gray-600 rounded-t-lg shadow-lg">
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

            {/* Table button - now opens a modal */}
            <ToolbarButton
              onClick={toggleTableModal}
              active={isTableModalOpen}
              icon={TableIcon}
              title="درج جدول"
            />
            <ToolbarButton
              onClick={() => setIsHtmlImportModalOpen(true)}
              icon={FileUp}
              title="وارد کردن HTML"
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
            <ToolbarButton
              onClick={toggleVideoModal}
              icon={Video}
              title="Add Video"
            />
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

      {/* Table Creation Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-3 text-right">
              ایجاد جدول
            </h3>

            <div className="flex justify-between gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm text-gray-300 mb-2 text-right">
                  تعداد سطرها
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setTableRows(Math.max(1, tableRows - 1))}
                    className="px-2 py-1 bg-gray-700 text-white rounded-r border border-gray-600"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) =>
                      setTableRows(parseInt(e.target.value) || 3)
                    }
                    className="w-12 px-2 py-1 bg-gray-900 border-t border-b border-gray-600 text-white text-center"
                  />
                  <button
                    onClick={() => setTableRows(Math.min(20, tableRows + 1))}
                    className="px-2 py-1 bg-gray-700 text-white rounded-l border border-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm text-gray-300 mb-2 text-right">
                  تعداد ستون‌ها
                </label>
                <div className="flex items-center">
                  <button
                    onClick={() => setTableCols(Math.max(1, tableCols - 1))}
                    className="px-2 py-1 bg-gray-700 text-white rounded-r border border-gray-600"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) =>
                      setTableCols(parseInt(e.target.value) || 3)
                    }
                    className="w-12 px-2 py-1 bg-gray-900 border-t border-b border-gray-600 text-white text-center"
                  />
                  <button
                    onClick={() => setTableCols(Math.min(10, tableCols + 1))}
                    className="px-2 py-1 bg-gray-700 text-white rounded-l border border-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={insertTable}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                ایجاد جدول
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HTML Import Modal */}
      {isHtmlImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-white mb-3">
              وارد کردن HTML
            </h3>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="کد HTML را اینجا وارد کنید..."
              className="w-full h-64 p-3 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="ltr"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setIsHtmlImportModalOpen(false);
                  setHtmlContent("");
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                انصراف
              </button>
              <button
                onClick={importHtml}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                وارد کردن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video upload modal */}
      {isVideoModalOpen && (
        <VideoUploadModal
          onClose={toggleVideoModal}
          onVideoUpload={addVideo}
        />
      )}

      {/* Improved Editor Content Area with ProseMirror Table Controls Extension */}
      <div className={editorContainerClasses}>
        <EditorContent
          editor={editor}
          className="focus:ring-2 focus:ring-blue-500 rounded-lg transition-all h-full relative"
        />

        {/* Custom in-place table controls that appear above each table when selected */}
        {editor.isActive("table") && (
          <div
            className="fixed z-40 bg-gray-800 border border-gray-600 rounded-md shadow-lg p-1 flex items-center gap-1"
            style={{
              // Position the controls at the top of the currently selected table node
              top: (() => {
                try {
                  const { state } = editor;
                  const { selection } = state;
                  const { $from } = selection;
                  const tablePos = $from.before(1); // Get position of closest parent table
                  const coordsAtPos = editor.view.coordsAtPos(tablePos);
                  return `${coordsAtPos.top - 40}px`; // Position above the table
                } catch (e) {
                  return "100px"; // Fallback if calculation fails
                }
              })(),
              // Center horizontally
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <button
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-0.5 rounded"
              title="افزودن ستون قبل"
            >
              ستون +
            </button>
            <button
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-0.5 rounded"
              title="حذف ستون"
            >
              ستون -
            </button>
            <button
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-0.5 rounded"
              title="افزودن سطر قبل"
            >
              سطر +
            </button>
            <button
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-0.5 rounded"
              title="حذف سطر"
            >
              سطر -
            </button>
            <button
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="text-sm bg-gray-600 hover:bg-gray-700 text-white px-3 py-0.5 rounded"
              title="حذف جدول"
            >
              حذف جدول
            </button>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="sticky -bottom-6 flex gap-2 p-4 bg-gray-800 border-t border-gray-600 rounded-b-lg">
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

      {/* Bubble Menu */}
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
