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
      <div className="group relative min-w-max flex-shrink-0 whitespace-nowrap rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3 text-center text-xs font-semibold text-blue-900 shadow-sm transition-all duration-300 hover:border-blue-500 hover:shadow-md group-hover:text-blue-600 md:text-base">
        {name}
      </div>
    </Link>
  );
};

export default CategoryCard;
