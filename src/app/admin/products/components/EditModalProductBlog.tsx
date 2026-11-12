import React, { useEffect, useRef } from "react";

import { TipTapEditor } from "@/components/editor/TipTapEditor";

type Props = {
  blog: string;
  onSave: (blog: string) => void;
  slug: string;
};

const EditModalProductBlog = ({ blog, onSave, slug }: Props) => {
  const blogContentRef = useRef<string>(blog || "");
  const onSaveRef = useRef(onSave);
  const slugRef = useRef(slug);

  // Keep refs in sync so the unmount effect never re-runs (and never loops).
  useEffect(() => {
    onSaveRef.current = onSave;
    slugRef.current = slug;
  });

  // Save the blog content only when the component unmounts
  useEffect(() => {
    return () => {
      // Only save if there's actual content and a slug
      if (blogContentRef.current && slugRef.current) {
        onSaveRef.current(blogContentRef.current);
      }
    };
  }, []);

  return (
    <div>
      <div>توضیحات تکمیلی محصول</div>
      {slug === "" ? (
        <p className="my-3 text-center font-extrabold text-red-300">
          ابتدا جزئیات پایه را وارد کنید، سپس مقاله را بنویسید.
        </p>
      ) : (
        <>
          <p className="my-3 text-center font-extrabold text-red-300">
            محتوای مقاله به صورت خودکار ذخیره خواهد شد
          </p>
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
