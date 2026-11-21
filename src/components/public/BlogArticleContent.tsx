import { sanitizeBlogMarkup } from "@/lib/blog-content";

interface BlogArticleContentProps {
  html: string;
  scopeId: string;
  css?: string;
  className?: string;
}

export function BlogArticleContent({ html, scopeId, css, className }: BlogArticleContentProps) {
  return (
    <>
      {css ? <style data-blog-content-styles dangerouslySetInnerHTML={{ __html: css }} /> : null}
      <div
        id={scopeId}
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizeBlogMarkup(html) }}
      />
    </>
  );
}
