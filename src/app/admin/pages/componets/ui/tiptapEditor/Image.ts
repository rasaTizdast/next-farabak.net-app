// src/lib/tiptap/extensions/Image.ts

import { Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageNode from "./ImageNode";

export interface ImageOptions {
  inline: boolean;
  HTMLAttributes: Record<string, any>;
}

export const CustomImage = Node.create<ImageOptions>({
  name: "image",
  group: "block",
  draggable: true,

  addAttributes() {
    return {
      ...this.parent?.(), // Inherit existing attributes
      width: {
        default: 0,
      },
      height: {
        default: 0,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
        getAttrs: (dom) => ({
          src: (dom as HTMLElement).getAttribute("src"),
          alt: (dom as HTMLElement).getAttribute("alt"),
          width: parseInt((dom as HTMLElement).getAttribute("width") || "0"),
          height: parseInt((dom as HTMLElement).getAttribute("height") || "0"),
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", HTMLAttributes];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNode);
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
