import type { Editor } from "@tiptap/react";
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
  Video,
} from "lucide-react";
import type { ReactNode } from "react";

interface TipTapToolbarProps {
  editor: Editor;
  onImageUpload?: () => void;
  onVideoEmbed?: () => void;
  showImageUpload?: boolean;
  showVideoEmbed?: boolean;
}

function ToolbarButton({
  onClick,
  isActive,
  children,
  title,
}: {
  onClick: () => void;
  isActive: boolean;
  children: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded p-1 transition-colors ${
        isActive ? "bg-primary text-white" : "text-gray-400 hover:bg-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

export function TipTapToolbar({
  editor,
  onImageUpload,
  onVideoEmbed,
  showImageUpload = true,
  showVideoEmbed = false,
}: TipTapToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-700 bg-gray-800/80 p-2 backdrop-blur-sm">
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        isActive={false}
        title="Undo"
      >
        <Undo size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        isActive={false}
        title="Redo"
      >
        <Redo size={18} />
      </ToolbarButton>
      <div className="mx-1 h-6 w-px bg-gray-600" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold"
      >
        <Bold size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic"
      >
        <Italic size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Code"
      >
        <Code size={18} />
      </ToolbarButton>
      <div className="mx-1 h-6 w-px bg-gray-600" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        isActive={editor.isActive("paragraph")}
        title="Paragraph"
      >
        <Pilcrow size={18} />
      </ToolbarButton>
      <div className="mx-1 h-6 w-px bg-gray-600" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Quote"
      >
        <Quote size={18} />
      </ToolbarButton>
      <div className="mx-1 h-6 w-px bg-gray-600" />
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <AlignLeft size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <AlignCenter size={18} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <AlignRight size={18} />
      </ToolbarButton>
      <div className="mx-1 h-6 w-px bg-gray-600" />
      <ToolbarButton
        onClick={() =>
          editor
            .chain()
            .focus()
            .toggleLink({ href: prompt("URL:") || "" })
            .run()
        }
        isActive={editor.isActive("link")}
        title="Link"
      >
        <Link2 size={18} />
      </ToolbarButton>
      {showImageUpload && onImageUpload && (
        <ToolbarButton onClick={onImageUpload} isActive={false} title="Image">
          <ImageIcon size={18} />
        </ToolbarButton>
      )}
      {showVideoEmbed && onVideoEmbed && (
        <ToolbarButton onClick={onVideoEmbed} isActive={false} title="Video">
          <Video size={18} />
        </ToolbarButton>
      )}
    </div>
  );
}
