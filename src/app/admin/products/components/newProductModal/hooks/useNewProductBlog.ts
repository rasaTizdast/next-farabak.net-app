"use client";

import { useCallback, useRef } from "react";

import { useNewProductWizard } from "../NewProductWizardContext";

export function useNewProductBlog() {
  const { state, actions } = useNewProductWizard();

  const contentRef = useRef(state.productBlog);

  const handleContentChange = useCallback(
    (content: string) => {
      if (content === contentRef.current) return;

      contentRef.current = content;

      actions.setProductBlog(content);
    },
    [actions]
  );

  return {
    productBlog: state.productBlog,
    handleContentChange,
    slug: state.slug,
  };
}
