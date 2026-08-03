import React, { useEffect, useRef } from "react";

import {TipTapEditor} from "@/components/editor/TipTapEditor";

type Props = {
  blog: string;
  onSave: (blog: string) => void;
  slug: string;
};

const EditModalProductBlog = ({ blog, onSave, slug }: Props) => {
  const blogContentRef = useRef<string>(blog || "");

  // When the component unmounts or when the user navigates away, save the blog content
  useEffect(() => {
    return () => {
      // Only save if there's actual content and a slug
      if (blogContentRef.current && slug) {
        onSave(blogContentRef.current);
      }
    };
  }, [onSave, slug]);

  return (
    <div>
      <div>توضیحات تکمیلی محصول</div>
      {slug === "" ? (
        <h1 className="my-3 text-center font-extrabold text-red-300">
          ابتدا جزئیات پایه را وارد کنید، سپس مقاله را بنویسید.
        </h1>
      ) : (
        <>
          <h1 className="my-3 text-center font-extrabold text-red-300">
            محتوای مقاله به صورت خودکار ذخیره خواهد شد
          </h1>
          <TipTapEditor
            content={blog}
            onChange={(content) => {
              blogContentRef.current = content;
              onSave(content);
            }}
          />
        </>
      )}
    </div>
  );
};

export default EditModalProductBlog;
