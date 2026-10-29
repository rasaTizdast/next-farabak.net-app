import { Suspense } from "react";

import { Reveal } from "@/components/motion/Reveal";
import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductsBlogContent } from "@/lib/data/products";

import BannerImage from "./BannerImage";
import BlogContent from "./BlogContent";
import { GridContentServer } from "./GridContentServer";
import { ProductGridSkeleton } from "./ProductListSkeletons";

interface ProductGridProps {
  title: string;
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
}

const BannerSkeleton = () => (
  <div
    className="mb-8 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-1"
    style={{ aspectRatio: "1920 / 600" }}
  >
    <Skeleton className="size-full rounded-lg" />
  </div>
);

const BlogSkeleton = () => (
  <div className="mx-auto mb-5 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 sm:p-5 md:p-7">
    <div className="space-y-3">
      <Skeleton className="h-4 w-full bg-slate-700" />
      <Skeleton className="h-4 w-5/6 bg-slate-700" />
      <Skeleton className="h-4 w-3/4 bg-slate-700" />
      <Skeleton className="h-4 w-full bg-slate-700" />
      <Skeleton className="h-4 w-2/3 bg-slate-700" />
    </div>
  </div>
);

const ProductIntro = ({ title, showSearch }: { title: string; showSearch: boolean }) => (
  <PageIntro
    eyebrow="کاتالوگ تجهیزات فرابک"
    title={title}
    description="مدل‌ها و راهکارهای مناسب پروژه‌تان را با مشخصات روشن، تصویر واقعی محصول و مسیر ارتباط با کارشناس پیدا کنید."
    actions={
      <>
        {showSearch ? <ActionLink href="/products/search">جستجوی مدل</ActionLink> : null}
        <ActionLink href="/contact-us" variant="secondary">
          مشاوره انتخاب
        </ActionLink>
      </>
    }
    className="py-8 md:py-12"
  />
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
      return await getProductsBlogContent({
        categorySlug: categorySlug ?? null,
        subcategorySlug: subcategorySlug ?? null,
        page: currentPage,
      });
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
    <div className="w-full">
      <Suspense fallback={<ProductIntro title={title} showSearch={!categorySlug} />}>
        {(async () => {
          const { topBlog } = await blogsPromise;
          if (topBlog) {
            return (
              <>
                <ProductIntro title={title} showSearch={!categorySlug} />
                <BlogContent text={topBlog} as="none" />
              </>
            );
          }
          return <ProductIntro title={title} showSearch={!categorySlug} />;
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
        <Reveal>
          <GridContentServer
            apiUrl={apiUrl}
            currentPage={currentPage}
            categorySlug={categorySlug}
            subcategorySlug={subcategorySlug}
            showSearch={!categorySlug}
          />
        </Reveal>
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
