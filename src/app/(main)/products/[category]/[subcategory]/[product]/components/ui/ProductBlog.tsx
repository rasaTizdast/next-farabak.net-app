import Script from "next/script";
import React from "react";

import { BlogArticleContent } from "@/components/public/BlogArticleContent";
import SourcesList from "@/components/SourcesList";
import { BRAND_SOURCES, buildSourcesFor, detectBrand } from "@/helpers/sources";
import {
  createBlogContentScopeId,
  extractScopedBlogStyles,
  sanitizeBlogMarkup,
  stripBlogEditorModeMarker,
} from "@/lib/blog-content";
import { normalizeEditorialHeadings } from "@/lib/seo/editorial-headings";

function processContentWithImageAndVideoUrls(content: string) {
  const baseUrl = process.env.LIARA_BUCKET_URL || "";
  const resolveAssetUrl = (src: string) => {
    if (/^(https?:|data:|blob:|\/)/i.test(src) || !baseUrl) return src;
    return `${baseUrl.replace(/\/$/, "")}/${src.replace(/^\//, "")}`;
  };

  // Support legacy Image tags and standard HTML image tags.
  let processedContent = content.replace(
    /<(Image|img)([^>]*)src="([^"]*)"([^>]*)/gi,
    (_match, tag: string, before: string, src: string, after: string) =>
      `<${tag}${before}src="${resolveAssetUrl(src)}"${after}`
  );

  // Process regular video sources
  processedContent = processedContent.replace(
    /<video([^>]*)src="([^"]*)"([^>]*)/gi,
    (_match, before: string, src: string, after: string) =>
      `<video${before}src="${resolveAssetUrl(src)}"${after}`
  );

  // Process TipTap video nodes - convert them to standard HTML5 video tags
  processedContent = processedContent.replace(
    /<div data-type="video"[^>]*>([\s\S]*?)<\/div>/g,
    (match) => {
      // Extract src attribute from the video tag inside the div
      const srcMatch = match.match(/src="([^"]*)"/);
      if (srcMatch && srcMatch[1]) {
        const src = srcMatch[1];
        const fullSrc = resolveAssetUrl(src);

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
  pageTitle: string;
  productSlug?: string;
};

const ProductBlog = ({ productBlog, pageTitle, productSlug }: Props) => {
  const contentScopeId = createBlogContentScopeId(productSlug || pageTitle);
  const cleanProductBlog = stripBlogEditorModeMarker(productBlog || "");
  if (!cleanProductBlog.trim()) return null;

  const { content: contentWithoutStyles, css: articleCss } = extractScopedBlogStyles(
    processContentWithImageAndVideoUrls(cleanProductBlog),
    contentScopeId
  );
  const articleHtml = normalizeEditorialHeadings(contentWithoutStyles, pageTitle);
  const safeArticleHtml = sanitizeBlogMarkup(articleHtml);
  const brandToken = detectBrand(cleanProductBlog);
  const brandOfficialUrls = brandToken ? BRAND_SOURCES[brandToken].map((source) => source.url) : [];
  const citationUrls = brandOfficialUrls.length > 0 ? brandOfficialUrls : null;
  const blogJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    articleBody: safeArticleHtml,
    sourceOrganization: {
      "@type": "Organization",
      name: "فرابک",
      url: "https://farabak.net",
    },
    ...(citationUrls ? { citation: citationUrls } : {}),
  }).replace(/</g, "\\u003c");

  return (
    <div data-product-section-content className="mx-auto w-full max-w-[1580px]">
      <article className="mt-5 w-full rounded-2xl border border-(--farabak-ink-deep)/10 bg-white p-4 shadow-[0_18px_45px_rgba(6,26,48,0.06)] sm:p-7">
        <div className="mb-5 text-start text-xl font-bold text-(--farabak-ink-deep) sm:text-2xl">
          توضیحات تکمیلی محصول
        </div>
        <div
          className="rounded-xl bg-(--farabak-paper) p-4 hyphens-auto sm:p-6"
          style={{
            overflowWrap: "break-word",
            wordWrap: "break-word",
            wordBreak: "break-word",
            hyphens: "auto",
          }}
        >
          <BlogArticleContent
            html={articleHtml}
            css={articleCss}
            scopeId={contentScopeId}
            className="prose-view overflow-wrap-break-word word-wrap-break-word word-break-break-word max-w-none"
          />
        </div>
        {brandToken ? (
          <SourcesList
            sources={buildSourcesFor(cleanProductBlog)}
            title="منابع و مراجع محصول"
            className="mt-5"
          />
        ) : null}
      </article>

      <Script
        id="productBlog"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: blogJsonLd,
        }}
      />
    </div>
  );
};

export default ProductBlog;
