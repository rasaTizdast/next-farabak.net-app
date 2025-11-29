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
      <div className="group relative min-w-max flex-shrink-0 rounded-lg border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-3 shadow-sm transition-all duration-300 hover:border-blue-500 hover:shadow-md">
        <h3 className="whitespace-nowrap text-center text-sm font-semibold text-blue-900 transition-colors duration-300 group-hover:text-blue-600 md:text-base">
          {name}
        </h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
