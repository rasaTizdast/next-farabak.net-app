import React from "react";
import TipTapBlogEditor from "../productBlogCreator/TipTapEditor";

type Props = {
  dispatch: React.Dispatch<{ type: string; productBlog: string }>;
  slug: string;
};

const ProductBlog = ({ dispatch, slug }: Props) => {
  return (
    <div>
      {slug === "" ? (
        <h1 className="my-3 text-center text-red-300 font-extrabold">
          ابتدا جزئیات پایه را وارد کنید، سپس مقاله را بنویسید.
        </h1>
      ) : (
        <>
          <h1 className="my-3 text-center text-red-300 font-extrabold">
            قبل از ذخیره محصول، ابتدا مقاله را ذخیره کنید
          </h1>
          <TipTapBlogEditor slug={slug} onSave={dispatch} />
        </>
      )}
    </div>
  );
};

export default ProductBlog;
