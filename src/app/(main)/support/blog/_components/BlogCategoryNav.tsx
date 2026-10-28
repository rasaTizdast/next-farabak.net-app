import Link from "next/link";

import { cn } from "@/lib/utils";

type BlogCategory = {
  id: number;
  name: string | null;
  slug: string | null;
};

interface BlogCategoryNavProps {
  categories: BlogCategory[];
  currentSlug?: string;
}

const BlogCategoryNav = ({ categories, currentSlug }: BlogCategoryNavProps) => {
  const validCategories = categories.filter((category) => category.slug);

  if (validCategories.length === 0) return null;

  return (
    <nav aria-label="دسته‌بندی مقالات" className="overflow-x-auto pb-2">
      <ul className="flex min-w-max gap-2">
        <li>
          <Link
            href="/support/blog"
            aria-current={!currentSlug ? "page" : undefined}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none",
              !currentSlug
                ? "border-(--farabak-action-blue) bg-(--farabak-action-blue) text-white"
                : "border-slate-200 bg-white text-(--farabak-ink-deep) hover:border-(--farabak-action-blue)"
            )}
          >
            همه مقالات
          </Link>
        </li>
        {validCategories.map((category) => {
          const isCurrent = category.slug === currentSlug;
          return (
            <li key={category.id}>
              <Link
                href={`/support/blog/${category.slug}`}
                aria-current={isCurrent ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none",
                  isCurrent
                    ? "border-(--farabak-action-blue) bg-(--farabak-action-blue) text-white"
                    : "border-slate-200 bg-white text-(--farabak-ink-deep) hover:border-(--farabak-action-blue)"
                )}
              >
                {category.name ?? category.slug}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default BlogCategoryNav;
