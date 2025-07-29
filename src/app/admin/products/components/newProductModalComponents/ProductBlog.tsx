import React, { useCallback, useRef } from "react";
import TipTapBlogEditor from "../productBlogCreator/TipTapEditor";

type Props = {
  dispatch: React.Dispatch<{ type: string; productBlog: string }>;
  slug: string;
};

const ProductBlog = ({ dispatch, slug }: Props) => {
  const contentRef = useRef<string>("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = useCallback(
    (contentObj: { productBlog: string }) => {
      const content = contentObj.productBlog;

      // Avoid unnecessary updates if content hasn't changed
      if (content === contentRef.current) return;

      // Update our reference immediately
      contentRef.current = content;

      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set up a new debounce timer for dispatch
      debounceTimerRef.current = setTimeout(() => {
        dispatch({
          type: "SET_PRODUCT_BLOG",
          productBlog: content,
        });
      }, 1000); // 1 second debounce
    },
    [dispatch]
  );

  return (
    <div>
      {slug === "" ? (
        <h1 className="my-3 text-center text-red-300 font-extrabold">
          ابتدا جزئیات پایه را وارد کنید، سپس مقاله را بنویسید.
        </h1>
      ) : (
        <>
          <h1 className="my-3 text-center text-red-300 font-extrabold">
            محتوای مقاله به صورت خودکار ذخیره خواهد شد
          </h1>
          <TipTapBlogEditor slug={slug} onSave={handleContentChange} />
        </>
      )}
    </div>
  );
};

export default ProductBlog;
