import { Suspense } from "react";

import BannerImage from "./BannerImage";
import BlogContent from "./BlogContent";
import { GridContentServer } from "./GridContentServer";
import { ProductGridSkeleton } from "./ProductListSkeletons";
import styles from "./ProductGrid.module.css";

interface ProductGridProps {
  title: string;
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
}

const BannerSkeleton = () => (
  <div className="mb-8 w-full animate-pulse rounded-md bg-gray-200" style={{ aspectRatio: "1920 / 600" }} />
);

const BlogSkeleton = () => (
  <div className="mx-auto mb-5 w-full animate-pulse rounded-xl border border-gray-800 bg-gray-800 p-3 sm:p-5 md:p-7">
    <div className="space-y-3">
      <div className="h-4 w-full rounded bg-gray-700" />
      <div className="h-4 w-5/6 rounded bg-gray-700" />
      <div className="h-4 w-3/4 rounded bg-gray-700" />
      <div className="h-4 w-full rounded bg-gray-700" />
      <div className="h-4 w-2/3 rounded bg-gray-700" />
    </div>
  </div>
);

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
      <Suspense fallback={<h1 className={styles.gridTitle}>{title}</h1>}>
        {(async () => {
          const { topBlog } = await blogsPromise;
          if (topBlog) {
            return <BlogContent text={topBlog} as="h1" />;
          }
          return <h1 className={styles.gridTitle}>{title}</h1>;
        })()}
      </Suspense>

      <Suspense fallback={<BannerSkeleton />}>
        {(async () => {
          const { banner } = await blogsPromise;
          if (!banner) return null;
          const src = `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/categoryBanners/${banner.replace(/^categoryBanners\//, "")}`;
          return <BannerImage src={src} alt="بنر محصول" />;
        })()}
      </Suspense>

      <Suspense fallback={<ProductGridSkeleton />}>
        <GridContentServer
          apiUrl={apiUrl}
          currentPage={currentPage}
          categorySlug={categorySlug}
          subcategorySlug={subcategorySlug}
        />
      </Suspense>

      <Suspense fallback={<BlogSkeleton />}>
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