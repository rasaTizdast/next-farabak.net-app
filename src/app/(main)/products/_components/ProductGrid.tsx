// src/app/(main)/products/_components/ProductGrid.tsx

import { Suspense } from "react";

import SkeletonLoader from "@/app/_components/ui/SkeletonLoader";

import BannerImage from "./BannerImage";
import BlogContent from "./BlogContent";
import { GridContentServer } from "./GridContentServer"; // Server component for products
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  title: string;
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  title,
  apiUrl,
  currentPage,
  categorySlug,
  subcategorySlug,
}) => {
  async function fetchBlogs() {
    try {
      const url = new URL("/api/products/blogs", process.env.NEXT_PUBLIC_BASE_URL);
      if (categorySlug) url.searchParams.set("categorySlug", categorySlug);
      if (subcategorySlug) url.searchParams.set("subcategorySlug", subcategorySlug);
      url.searchParams.set("page", String(currentPage));
      const res = await fetch(url.toString(), { next: { revalidate: 60 } });
      if (!res.ok)
        return { topBlog: null, bottomBlog: null, banner: null } as {
          topBlog: string | null;
          bottomBlog: string | null;
          banner: string | null;
        };
      return (await res.json()) as {
        topBlog: string | null;
        bottomBlog: string | null;
        banner: string | null;
      };
    } catch {
      return { topBlog: null, bottomBlog: null, banner: null } as {
        topBlog: string | null;
        bottomBlog: string | null;
        banner: string | null;
      };
    }
  }

  const blogsPromise = fetchBlogs();

  return (
    <div className={styles.gridContainer}>
      {/* Top Blog replaces current H1 when present */}
      <Suspense fallback={<h1 className={styles.gridTitle}>{title}</h1>}>
        {/** Render top blog or fallback to H1 */}
        {(async () => {
          const { topBlog } = await blogsPromise;
          if (topBlog) {
            return <BlogContent text={topBlog} as="h1" />;
          }
          return <h1 className={styles.gridTitle}>{title}</h1>;
        })()}
      </Suspense>

      {/** Banner under title and first blog section (full-width) */}
      <Suspense>
        {(async () => {
          const { banner } = await blogsPromise;
          if (!banner) return null;
          const src = `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${banner}`;
          return <BannerImage src={src} alt="banner" />;
        })()}
      </Suspense>

      <Suspense fallback={<SkeletonLoader amount={15} />}>
        <GridContentServer
          apiUrl={apiUrl}
          currentPage={currentPage}
          categorySlug={categorySlug}
          subcategorySlug={subcategorySlug}
        />
      </Suspense>

      {/* Bottom Blog after grid */}
      <Suspense>
        {(async () => {
          const { bottomBlog } = await blogsPromise;
          if (!bottomBlog) return null;
          return (
            <div className="mt-10">
              <BlogContent text={bottomBlog} as="h2" />
            </div>
          );
        })()}
      </Suspense>
    </div>
  );
};

export default ProductGrid;
