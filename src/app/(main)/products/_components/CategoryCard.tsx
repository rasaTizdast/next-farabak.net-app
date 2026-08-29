import Link from "next/link";

interface CategoryCardProps {
  name: string;
  slug: string;
  banner?: string | null;
  link: string;
  type?: "category" | "subcategory";
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, link }) => {
  return (
    <Link href={link}>
      <div className="group relative min-w-max shrink-0 rounded-lg border-2 border-blue-300 bg-linear-to-r from-blue-50 to-blue-100 px-6 py-3 text-center text-xs font-semibold whitespace-nowrap text-blue-900 shadow-sm transition-[border-color,color,box-shadow] duration-300 group-hover:text-blue-600 hover:border-blue-500 hover:shadow-md md:text-base">
        {name}
      </div>
    </Link>
  );
};

export default CategoryCard;
