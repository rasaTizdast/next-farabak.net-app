import Script from "next/script";
import React from "react";

import SourcesList from "@/components/SourcesList";
import { BRAND_SOURCES, buildSourcesFor, detectBrand } from "@/helpers/sources";

function processContentWithImageAndVideoUrls(content: string) {
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
}

type Props = {
  productBlog: string;
};

const ProductBlog = ({ productBlog }: Props) => {
  if (!productBlog?.trim()) return null;

  const articleHtml = processContentWithImageAndVideoUrls(productBlog);
  const brandToken = detectBrand(productBlog);
  const brandOfficialUrls = brandToken ? BRAND_SOURCES[brandToken].map((source) => source.url) : [];
  const citationUrls = brandOfficialUrls.length > 0 ? brandOfficialUrls : null;

  return (
    <div data-product-section-content>
      <article className="mx-auto mt-5 w-full max-w-[1580px] rounded-2xl border border-(--farabak-ink-deep)/10 bg-white p-4 shadow-[0_18px_45px_rgba(6,26,48,0.06)] sm:p-7">
        <div className="mb-5 text-start text-xl font-bold text-(--farabak-ink-deep) sm:text-2xl">
          توضیحات تکمیلی محصول
        </div>
        <div
          className="prose-view overflow-wrap-break-word word-wrap-break-word word-break-break-word max-w-none rounded-xl bg-(--farabak-paper) p-4 hyphens-auto sm:p-6"
          style={{
            overflowWrap: "break-word",
            wordWrap: "break-word",
            wordBreak: "break-word",
            hyphens: "auto",
          }}
          dangerouslySetInnerHTML={{
            __html: articleHtml,
          }}
        />
        {brandToken ? (
          <SourcesList
            sources={buildSourcesFor(productBlog)}
            title="منابع و مراجع محصول"
            className="mt-5"
          />
        ) : null}
      </article>

      <Script
        id="productBlog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            articleBody: articleHtml,
            sourceOrganization: {
              "@type": "Organization",
              name: "فرابک",
              url: "https://farabak.net",
            },
            ...(citationUrls ? { citation: citationUrls } : {}),
          }),
        }}
      />
    </div>
  );
};

export default ProductBlog;
