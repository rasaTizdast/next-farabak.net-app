"use client";
// InitializedMDXEditor.tsx

import {
  // H1,
  // H2,
  // H3,
  // H4,
  // H5,
  // H6,
  // Paragraph,
  CustomImage,
  // CustomLink,
  // UnorderedList,
  // OrderedList,
  // ListItem,
  // Section,
} from "@/app/_components/mdx/index";

import type { ForwardedRef } from "react";
import {
  headingsPlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  DiffSourceToggleWrapper,
  linkDialogPlugin,
  diffSourcePlugin,
  imagePlugin,
  InsertImage,
  jsxPlugin,
  InsertThematicBreak,
  Separator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

import {
  InsertH1,
  InsertH2,
  InsertH3,
  InsertH4,
  InsertH5,
  InsertH6,
  InsertLi,
  InsertLink,
  InsertOl,
  InsertParagraph,
  InsertSection,
  InsertUl,
} from "./ToolTipComponents";

import { jsxComponentDescriptors } from "./jsxComponentDescriptors";

// Only import this to the next file
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        jsxPlugin({ jsxComponentDescriptors }),
        headingsPlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        linkDialogPlugin(),
        diffSourcePlugin(),
        // imagePlugin({ imageUploadHandler }),
        imagePlugin(),
        thematicBreakPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <DiffSourceToggleWrapper>
                <UndoRedo />
                <Separator />
                <InsertSection />
                <Separator />
                <BoldItalicUnderlineToggles />
                <InsertThematicBreak />
                <Separator />
                <InsertParagraph />
                <InsertH1 />
                <InsertH2 />
                <InsertH3 />
                <InsertH4 />
                <InsertH5 />
                <InsertH6 />
                <Separator />
                <InsertLink />
                <InsertImage />
                <Separator />
                <InsertUl />
                <InsertOl />
                <InsertLi />
              </DiffSourceToggleWrapper>
            </>
          ),
        }),
      ]}
      {...props}
      ref={editorRef}
    />
  );
}
