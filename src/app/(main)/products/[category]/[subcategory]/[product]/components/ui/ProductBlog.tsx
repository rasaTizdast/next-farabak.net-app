import Script from "next/script";
import React from "react";

type Props = {
  productBlog: string;
};

const ProductBlog = ({ productBlog }: Props) => {
  const processContentWithImageUrls = (content: string) => {
    const baseUrl = process.env.LIARA_BUCKET_URL || "";
    return content.replace(
      /<Image([^>]*)src="([^"]*)"([^>]*)/g,
      (match, before, src, after) => {
        if (src.startsWith(baseUrl)) return match;
        return `<Image${before}src="${baseUrl}/${src}"${after}`;
      }
    );
  };

  if (!productBlog) {
    return (
      <div className="mt-5 p-5 text-lg font-bold text-center bg-gray-200 rounded-lg shadow-lg">
        توضیحات تکمیلی برای این محصول یافت نشد
      </div>
    );
  }

  return (
    <div>
      <article className="max-w-[1580px] w-full mt-5 mx-auto bg-gray-300 p-5 rounded-lg shadow-lg">
        <div className="text-center font-bold text-2xl mb-5">
          توضیحات تکمیلی محصول
        </div>
        <div
          className="prose-view max-w-none bg-gray-200 p-5 rounded-lg shadow-md"
          dangerouslySetInnerHTML={{
            __html: processContentWithImageUrls(productBlog),
          }}
        />
      </article>

      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            articleBody: processContentWithImageUrls(productBlog),
          }),
        }}
      />
    </div>
  );
};

export default ProductBlog;
