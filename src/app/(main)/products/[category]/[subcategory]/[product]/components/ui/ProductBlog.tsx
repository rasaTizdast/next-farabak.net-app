import Script from "next/script";
import React from "react";

type Props = {
  productBlog: string;
};

const ProductBlog = ({ productBlog }: Props) => {
  const processContentWithImageAndVideoUrls = (content: string) => {
    const baseUrl = process.env.LIARA_BUCKET_URL || "";

    // Process image URLs
    let processedContent = content.replace(
      /<Image([^>]*)src="([^"]*)"([^>]*)/g,
      (match, before, src, after) => {
        if (src.startsWith(baseUrl)) return match;
        return `<Image${before}src="${baseUrl}/${src}"${after}`;
      }
    );

    // Process regular video sources
    processedContent = processedContent.replace(
      /<video([^>]*)src="([^"]*)"([^>]*)/g,
      (match, before, src, after) => {
        if (src.startsWith(baseUrl) || src.startsWith("http")) return match;
        return `<video${before}src="${baseUrl}/${src}"${after}`;
      }
    );

    // Process TipTap video nodes - convert them to standard HTML5 video tags
    processedContent = processedContent.replace(
      /<div data-type="video"[^>]*>([\s\S]*?)<\/div>/g,
      (match) => {
        // Extract src attribute from the video tag inside the div
        const srcMatch = match.match(/src="([^"]*)"/);
        if (srcMatch && srcMatch[1]) {
          const src = srcMatch[1];
          const fullSrc =
            src.startsWith(baseUrl) || src.startsWith("http") ? src : `${baseUrl}/${src}`;

          // Replace the entire div with a simple video element
          return `<video src="${fullSrc}" controls class="w-full max-w-4xl mx-auto rounded-md my-4"></video>`;
        }
        return match;
      }
    );

    // Ensure videos have controls
    processedContent = processedContent.replace(
      /<video(?![^>]*controls)([^>]*)/g,
      "<video$1 controls "
    );

    return processedContent;
  };

  if (!productBlog) {
    return (
      <div className="mt-5 rounded-lg bg-gray-200 p-5 text-center text-lg font-bold shadow-lg">
        توضیحات تکمیلی برای این محصول یافت نشد
      </div>
    );
  }

  return (
    <div>
      <article className="mx-auto mt-5 w-full max-w-[1580px] rounded-lg bg-gray-300 p-5 shadow-lg">
        <div className="mb-5 text-center text-2xl font-bold">توضیحات تکمیلی محصول</div>
        <div
          className="prose-view overflow-wrap-break-word word-wrap-break-word word-break-break-word max-w-none hyphens-auto rounded-lg bg-gray-200 p-5 shadow-md"
          style={{
            overflowWrap: "break-word",
            wordWrap: "break-word",
            wordBreak: "break-word",
            hyphens: "auto",
          }}
          dangerouslySetInnerHTML={{
            __html: processContentWithImageAndVideoUrls(productBlog),
          }}
        />
      </article>

      <Script
        id="productBlog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            articleBody: processContentWithImageAndVideoUrls(productBlog),
          }),
        }}
      />
    </div>
  );
};

export default ProductBlog;
