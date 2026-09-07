"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useState, useCallback, useEffect } from "react";

import { sharedExtensions } from "./extensions";
import { TipTapToolbar } from "./TipTapToolbar";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  showImageUpload?: boolean;
  showVideoEmbed?: boolean;
  maxImages?: number;
}

export function TipTapEditor({
  content,
  onChange,
  editable = true,
  showImageUpload = true,
  showVideoEmbed = false,
  maxImages = 10,
}: TipTapEditorProps) {
  const [imageCount, setImageCount] = useState(0);

  const editor = useEditor({
    extensions: sharedExtensions,
    content,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleImageUpload = useCallback(() => {
    if (maxImages && imageCount >= maxImages) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !editor) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        editor.chain().focus().setImage({ src: url }).run();
        setImageCount((c) => c + 1);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [editor, imageCount, maxImages]);

  const handleVideoEmbed = useCallback(() => {
    if (!editor) return;
    const url = prompt("آدرس ویدیو را وارد کنید:");
    if (url) {
      editor.chain().focus().insertContent(`<video src="${url}" controls></video>`).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900" dir="rtl">
      <div className="sticky -top-6 z-10">
        <TipTapToolbar
          editor={editor}
          onImageUpload={handleImageUpload}
          onVideoEmbed={handleVideoEmbed}
          showImageUpload={showImageUpload}
          showVideoEmbed={showVideoEmbed}
        />
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-invert prose-sm max-w-none p-4 [&_h1]:text-right [&_h2]:text-right [&_h3]:text-right [&_li]:text-right [&_p]:text-right"
      />
    </div>
  );
}
