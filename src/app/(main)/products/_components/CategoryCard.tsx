import Link from "next/link";

interface CategoryCardProps {
  name: string;
  slug: string;
  banner?: string | null;
  link: string;
  type?: "category" | "subcategory";
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, slug, link, type = "category" }) => {
  return (
    <Link
      href={link}
      data-category-slug={slug}
      className="group flex min-h-12 min-w-max shrink-0 items-center rounded-xl border border-(--farabak-ink-deep)/10 bg-white px-5 py-3 text-center text-sm font-semibold whitespace-nowrap text-(--farabak-ink-deep) shadow-[0_5px_20px_rgba(6,26,48,0.05)] transition-[border-color,color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-(--farabak-action-blue)/50 hover:text-(--farabak-action-blue) hover:shadow-[0_10px_25px_rgba(6,26,48,0.1)] focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none md:text-base"
      aria-label={`مشاهده ${type === "subcategory" ? "زیر" : ""}دسته‌بندی ${name}`}
    >
      {name}
    </Link>
  );
};

export default CategoryCard;
