"use client";

import { useCallback, useRef } from "react";

import { useNewProductWizard } from "../NewProductWizardContext";

export function useNewProductBlog() {
  const { state, actions } = useNewProductWizard();

  const contentRef = useRef<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = useCallback(
    (content: string) => {
      if (content === contentRef.current) return;

      contentRef.current = content;

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        actions.setProductBlog(content);
      }, 1000);
    },
    [actions]
  );

  return {
    productBlog: state.productBlog,
    handleContentChange,
    slug: state.slug,
  };
}
