import React, { useEffect, useRef } from "react";
import TipTapBlogEditor from "../productBlogCreator/TipTapEditor";

type Props = {
  dispatch: React.Dispatch<{ type: string; productBlog: string }>;
  slug: string;
};

const ProductBlog = ({ dispatch, slug }: Props) => {
  const editorContentRef = useRef<string>("");

  // Function to capture content changes from the editor
  const handleContentChange = (content: string) => {
    editorContentRef.current = content;
  };

  // Save the content when component unmounts or when user moves away from this step
  useEffect(() => {
    return () => {
      // Only dispatch if we have content and a valid slug
      if (editorContentRef.current && slug) {
        dispatch({
          type: "SET_PRODUCT_BLOG",
          productBlog: editorContentRef.current,
        });
      }
    };
  }, [dispatch, slug]);

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
          <TipTapBlogEditor
            slug={slug}
            onSave={(contentObj) => {
              // Store content in ref for auto-save
              handleContentChange(contentObj.productBlog);
              // Also dispatch immediately when manual save is clicked
              dispatch(contentObj);
            }}
          />
        </>
      )}
    </div>
  );
};

export default ProductBlog;
