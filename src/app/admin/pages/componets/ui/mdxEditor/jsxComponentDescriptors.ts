import { GenericJsxEditor, JsxComponentDescriptor } from "@mdxeditor/editor";

export const jsxComponentDescriptors: JsxComponentDescriptor[] = [
  {
    name: "CustomLink",
    kind: "text", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    // it won't be actually sourced.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [{ name: "href", type: "string" }],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "UnorderedList",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "OrderedList",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "ListItem",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "Section",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "Paragraph",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "H1",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "H2",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "H3",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "H4",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "H5",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
  {
    name: "H6",
    kind: "flow", // 'text' for inline, 'flow' for block
    // the source field is used to construct the import statement at the top of the markdown document.
    source: "@/app/_components/mdx/index",
    // Used to construct the property popover of the generic editor
    props: [],
    // whether the component has children or not
    hasChildren: true,
    Editor: GenericJsxEditor,
  },
];
