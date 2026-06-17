// src/components/TipTapBlogEditor.tsx

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
import { useState, useCallback, useEffect, useRef } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";

import { Divider } from "./Divider";
import { CustomImage } from "./Image";
import { ToolbarButton } from "./ToolbarButton";
import { CustomVideo } from "../productBlogEditor/Video";
import VideoUploadModal from "../productBlogEditor/VideoUploadModal";

// Update the interface to include initialContent prop
interface TipTapBlogEditorProps {
  onSave?: React.Dispatch<{ type: string; productBlog: string }>;
  blogData?: string; // Add prop for initial content
  slug: string;
  initialContent?: string; // Add new prop for initial content
}

const TipTapBlogEditor = ({ onSave, blogData, slug }: TipTapBlogEditorProps) => {
  const [isLinkMenuOpen, setIsLinkMenuOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isImageLoading, setIsImageLoading] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [isHtmlImportModalOpen, setIsHtmlImportModalOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const { mutate: uploadImage } = useApiMutation("post");
  const { mutate: uploadVideo } = useApiMutation("post");

  // Add refs to track content changes and prevent infinite loops
  const prevContentRef = useRef<string>("");
  const isUpdatingContentRef = useRef(false);

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

  // Define convertMDXToHTML before using it in useEffects
  const convertMDXToHTML = useCallback((mdxContent: string) => {
    return (
      mdxContent
        // Convert Next.js Image components to regular img tags
        .replace(
          /<Image\s+src="([^"]+)"\s+alt="([^"]+)"[^>]*width=\{(\d+)\}[^>]*height=\{(\d+)\}[^>]*\/?>/g,
          '<img src="$1" alt="$2" width="$3" height="$4" class="rounded-lg max-w-full my-4" />'
        )
        // Convert Next.js Link components to regular a tags
        .replace(/<Link\s+href="([^"]+)">\s*([\s\S]*?)\s*<\/Link>/g, '<a href="$1">$2</a>')
        // Convert table with className to plain HTML table
        .replace(/<table className="[^"]*">/g, "<table>")
        .replace(/<th className="[^"]*">/g, "<th>")
        .replace(/<td className="[^"]*">/g, "<td>")
    );
  }, []);

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
      // Replace the existing ResizableImage configuration in the editor setup
      CustomImage,
      CustomVideo.configure({
        HTMLAttributes: { class: "w-full my-4" },
      }),
    ],
    content: blogData || "", // Initialize with blogData
    onUpdate: ({ editor }) => {
      // Only process updates if we're not currently updating from external source
      if (isUpdatingContentRef.current) return;

      // Start a timer to auto-save after user stops typing for 1 second
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        const mdxContent = convertToMDX(editor.getHTML());
        onSave?.({ type: "SET_PRODUCT_BLOG", productBlog: mdxContent });
      }, 1000);
    },
  });

  // Update editor content when blogData changes
  useEffect(() => {
    if (editor && blogData && !isUpdatingContentRef.current) {
      if (prevContentRef.current === "" || blogData !== prevContentRef.current) {
        isUpdatingContentRef.current = true;
        let timer: ReturnType<typeof setTimeout> | null = null;

        try {
          const htmlContent = convertMDXToHTML(blogData);
          if (htmlContent !== editor.getHTML()) {
            timer = setTimeout(() => {
              editor.commands.setContent(htmlContent);
              prevContentRef.current = blogData;

              timer = setTimeout(() => {
                isUpdatingContentRef.current = false;
              }, 200);
            }, 0);
          } else {
            isUpdatingContentRef.current = false;
          }
        } catch (e) {
          console.error("Error updating editor content:", e);
          isUpdatingContentRef.current = false;
        }

        return () => {
          if (timer) clearTimeout(timer);
        };
      }
    }
  }, [editor, blogData, convertMDXToHTML]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

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

    // Safely clean and insert HTML at cursor position
    try {
      // Store the current cursor position
      editor.chain().focus().insertContent(htmlContent).run();
      setHtmlContent("");
      setIsHtmlImportModalOpen(false);
    } catch (error) {
      console.error("Failed to import HTML:", error);
      alert("Failed to import HTML. Please check your HTML content.");
    }
  }, [editor, htmlContent]);

  const convertToMDX = useCallback((html: string) => {
    // Convert editor content to MDX
    let mdxContent = html
      // Convert img tags to Next.js Image components
      .replace(
        /<img\s+src="([^"]+)"\s+alt="([^"]+)"[^>]*width="([^"]+)"[^>]*height="([^"]+)"[^>]*>/g,
        '<Image src="$1" alt="$2" width={1000} height={900} quality={100} layout="responsive" />'
      )
      // Convert a tags to Next.js Link components
      .replace(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, '<Link href="$1">$2</Link>');

    // Preserve table structure but add styling classes for MDX
    mdxContent = mdxContent
      .replace(/<table[^>]*>/g, '<table className="w-full my-4 border-collapse" dir="rtl">')
      .replace(/<th[^>]*>/g, '<th className="border border-gray-600 bg-gray-700 p-2 text-right">')
      .replace(/<td[^>]*>/g, '<td className="border border-gray-600 p-2 text-right">');

    return mdxContent;
  }, []);

  const addImage = useCallback(
    async (file: File) => {
      if (!editor || file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }

      setIsImageLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", slug);

      const result = await uploadImage("/api/products/productBlog/upload", formData) as { url: string } | null;
      if (!result) {
        alert("Failed to upload image");
        setIsImageLoading(false);
        return;
      }

      const { url } = result;
      const { width, height } = await calculateDimensions(url);

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
              slug,
              size: "full",
            },
          })
          .run();
      });
      setIsImageLoading(false);
    },
    [editor, slug, uploadImage]
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

  const addVideo = useCallback(
    async (file: File) => {
      if (!editor) {
        return;
      }

      if (file.size > 1.5 * 1024 * 1024 * 1024) {
        alert("ویدیو باید کمتر از 1.5 گیگابایت باشد");
        return;
      }

      setIsVideoLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("slug", slug);

      const result = await uploadVideo("/api/products/productBlog/uploadVideo", formData) as { url: string } | null;
      if (!result) {
        alert("Failed to upload video");
        setIsVideoLoading(false);
        return;
      }

      const { url } = result;

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
      setIsVideoLoading(false);
    },
    [editor, slug, uploadVideo]
  );

  const toggleVideoModal = () => {
    setIsVideoModalOpen(!isVideoModalOpen);
  };

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

  if (!editor) return null;

  return (
    <div
      className="relative flex min-h-[500px] flex-col rounded-lg border border-gray-600 bg-gray-800 text-gray-100"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPaste={handlePaste}
      ref={editorContainerRef}
    >
      {/* Fixed Toolbar */}
      <div className="sticky top-0 z-20 rounded-t-lg border-b border-gray-600 bg-gray-800 p-2 shadow-lg">
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

            {/* Table button - opens a modal */}
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
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive("heading", { level: 1 })}
              icon={Heading1}
              title="Heading 1"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive("heading", { level: 2 })}
              icon={Heading2}
              title="Heading 2"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive("heading", { level: 3 })}
              icon={Heading3}
              title="Heading 3"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
              active={editor.isActive("heading", { level: 4 })}
              icon={Heading4}
              title="Heading 4"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
              active={editor.isActive("heading", { level: 5 })}
              icon={Heading5}
              title="Heading 5"
            />
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
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
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
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
            <label className="cursor-pointer rounded-md p-2 text-gray-300 hover:bg-gray-600">
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addImage(file);
                }}
              />
              <ImageIcon className="h-5 w-5" />
            </label>
            <ToolbarButton onClick={toggleVideoModal} icon={Video} title="Add Video" />
            {isImageLoading && (
              <div className="ml-2 flex items-center gap-2 text-sm text-gray-400">
                <Divider />
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
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
                className="rounded-md border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => e.key === "Enter" && setLink()}
              />
              <button
                type="button"
                onClick={setLink}
                className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
              >
                ثبت
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Creation Modal */}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-gray-800 p-4 shadow-lg">
            <h3 className="mb-3 text-right text-lg font-semibold text-white">ایجاد جدول</h3>

            <div className="mb-6 flex justify-between gap-4">
              <div className="flex-1">
                <label className="mb-2 block text-right text-sm text-gray-300">تعداد سطرها</label>
                <div className="flex items-center">
                  <button type="button"
                    onClick={() => setTableRows(Math.max(1, tableRows - 1))}
                    className="rounded-r border border-gray-600 bg-gray-700 px-2 py-1 text-white"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                    className="w-12 border-b border-t border-gray-600 bg-gray-900 px-2 py-1 text-center text-white"
                  />
                  <button type="button"
                    onClick={() => setTableRows(Math.min(20, tableRows + 1))}
                    className="rounded-l border border-gray-600 bg-gray-700 px-2 py-1 text-white"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <label className="mb-2 block text-right text-sm text-gray-300">تعداد ستون‌ها</label>
                <div className="flex items-center">
                  <button type="button"
                    onClick={() => setTableCols(Math.max(1, tableCols - 1))}
                    className="rounded-r border border-gray-600 bg-gray-700 px-2 py-1 text-white"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                    className="w-12 border-b border-t border-gray-600 bg-gray-900 px-2 py-1 text-center text-white"
                  />
                  <button type="button"
                    onClick={() => setTableCols(Math.min(10, tableCols + 1))}
                    className="rounded-l border border-gray-600 bg-gray-700 px-2 py-1 text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsTableModalOpen(false)}
                className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={insertTable}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                ایجاد جدول
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HTML Import Modal */}
      {isHtmlImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-gray-800 p-4 shadow-lg">
            <h3 className="mb-3 text-lg font-semibold text-white">وارد کردن HTML</h3>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="کد HTML را اینجا وارد کنید..."
              className="h-64 w-full rounded-md border border-gray-600 bg-gray-700 p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              dir="ltr"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsHtmlImportModalOpen(false);
                  setHtmlContent("");
                }}
                className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={importHtml}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                وارد کردن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Improved Editor Content Area */}
      <div className={editorContainerClasses}>
        <EditorContent
          editor={editor}
          className="h-full rounded-lg transition-all focus:ring-2 focus:ring-blue-500"
        />

        {/* Custom in-place table controls that appear above each table when selected */}
        {editor.isActive("table") && (
          <div
            className="fixed z-40 flex items-center gap-1 rounded-md border border-gray-600 bg-gray-800 p-1 shadow-lg"
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
                  console.error(e);
                  return "100px"; // Fallback if calculation fails
                }
              })(),
              // Center horizontally
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <button type="button"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              className="rounded bg-blue-600 px-3 py-0.5 text-sm text-white hover:bg-blue-700"
              title="افزودن ستون قبل"
            >
              ستون +
            </button>
            <button type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="rounded bg-red-600 px-3 py-0.5 text-sm text-white hover:bg-red-700"
              title="حذف ستون"
            >
              ستون -
            </button>
            <button type="button"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              className="rounded bg-green-600 px-3 py-0.5 text-sm text-white hover:bg-green-700"
              title="افزودن سطر قبل"
            >
              سطر +
            </button>
            <button type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="rounded bg-red-600 px-3 py-0.5 text-sm text-white hover:bg-red-700"
              title="حذف سطر"
            >
              سطر -
            </button>
            <button type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="rounded bg-gray-600 px-3 py-0.5 text-sm text-white hover:bg-gray-700"
              title="حذف جدول"
            >
              حذف جدول
            </button>
          </div>
        )}
      </div>

      {/* Bubble Menu (for text formatting) */}
      {editor && (
        <BubbleMenu
          className="flex items-center gap-1 rounded-lg border border-gray-600 bg-gray-700 p-2 shadow-xl"
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

      {/* Video Modal */}
      {isVideoModalOpen && <VideoUploadModal onClose={toggleVideoModal} onVideoUpload={addVideo} />}

      {/* Video Loading Indicator */}
      {isVideoLoading && (
        <div className="fixed bottom-20 right-6 flex items-center gap-2 rounded-md bg-gray-700 px-3 py-1 text-sm text-gray-200 shadow-lg">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
          در حال آپلود ویدیو...
        </div>
      )}
    </div>
  );
};

export default TipTapBlogEditor;
