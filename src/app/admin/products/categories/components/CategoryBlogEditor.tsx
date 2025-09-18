"use client";

import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link2,
  Pilcrow,
  Table as TableIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

interface CategoryBlogEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CategoryBlogEditor({
  label,
  value,
  onChange,
  placeholder,
}: CategoryBlogEditorProps) {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[180px] rounded-lg border border-gray-700 bg-gray-800 p-3 outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [editor, value]);

  if (!editor) return null;

  const promptLink = () => {
    const url = window.prompt("لینک را وارد کنید:", "https://");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="mb-4">
      <label className="mb-2 block text-sm">{label}</label>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          <Pilcrow className="inline h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          <Heading1 className="inline h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          <Heading2 className="inline h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          <Heading3 className="inline h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          <Bold className="inline h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          <Italic className="inline h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          <List className="inline h-4 w-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          <ListOrdered className="inline h-4 w-4" />
        </button>
        <button
          onClick={promptLink}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          <Link2 className="inline h-4 w-4" />
        </button>
        <button
          onClick={() => setIsTableModalOpen(true)}
          className="rounded bg-gray-600 px-2 py-1 text-sm hover:bg-gray-500"
        >
          <TableIcon className="inline h-4 w-4" />
        </button>
      </div>
      <div className="tiptap-editor">
        <EditorContent editor={editor} />
      </div>
      {placeholder && !value && <p className="mt-1 text-xs text-gray-400">{placeholder}</p>}
      {isTableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-gray-800 p-4 text-white shadow-lg">
            <h3 className="mb-3 text-lg">ایجاد جدول</h3>
            <div className="mb-6 flex gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-sm">سطر</label>
                <div className="flex items-center">
                  <button
                    onClick={() => setTableRows(Math.max(1, tableRows - 1))}
                    className="rounded-r border border-gray-600 bg-gray-700 px-2 py-1"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableRows}
                    onChange={(e) => setTableRows(parseInt(e.target.value) || 3)}
                    className="w-14 border-b border-t border-gray-600 bg-gray-900 px-2 py-1 text-center"
                  />
                  <button
                    onClick={() => setTableRows(Math.min(20, tableRows + 1))}
                    className="rounded-l border border-gray-600 bg-gray-700 px-2 py-1"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm">ستون</label>
                <div className="flex items-center">
                  <button
                    onClick={() => setTableCols(Math.max(1, tableCols - 1))}
                    className="rounded-r border border-gray-600 bg-gray-700 px-2 py-1"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableCols}
                    onChange={(e) => setTableCols(parseInt(e.target.value) || 3)}
                    className="w-14 border-b border-t border-gray-600 bg-gray-900 px-2 py-1 text-center"
                  />
                  <button
                    onClick={() => setTableCols(Math.min(10, tableCols + 1))}
                    className="rounded-l border border-gray-600 bg-gray-700 px-2 py-1"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsTableModalOpen(false)}
                className="rounded bg-gray-600 px-3 py-1"
              >
                انصراف
              </button>
              <button
                onClick={() => {
                  if (!editor) return;
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true })
                    .run();
                  setIsTableModalOpen(false);
                }}
                className="rounded bg-blue-600 px-3 py-1"
              >
                ایجاد
              </button>
            </div>
          </div>
        </div>
      )}
      {editor?.isActive("table") && (
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="rounded bg-blue-600 px-2 py-1 text-sm"
          >
            ستون +
          </button>
          <button
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="rounded bg-red-600 px-2 py-1 text-sm"
          >
            ستون -
          </button>
          <button
            onClick={() => editor.chain().focus().addRowBefore().run()}
            className="rounded bg-green-600 px-2 py-1 text-sm"
          >
            سطر +
          </button>
          <button
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="rounded bg-red-600 px-2 py-1 text-sm"
          >
            سطر -
          </button>
          <button
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="rounded bg-gray-600 px-2 py-1 text-sm"
          >
            حذف جدول
          </button>
        </div>
      )}
      <style jsx>{`
        .tiptap-editor :global(.ProseMirror table) {
          width: 100%;
          border-collapse: collapse;
        }
        .tiptap-editor :global(.ProseMirror th),
        .tiptap-editor :global(.ProseMirror td) {
          border: 1px solid #374151; /* tailwind gray-700 */
          padding: 0.5rem;
        }
        .tiptap-editor :global(.ProseMirror th) {
          background-color: #1f2937; /* tailwind gray-800 */
        }
      `}</style>
    </div>
  );
}
