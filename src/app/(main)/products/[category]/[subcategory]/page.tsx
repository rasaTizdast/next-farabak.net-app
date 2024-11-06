import { Metadata } from "next";
import ProductGrid from "@/app/(main)/products/_components/ProductGrid";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import categoryPagesData from "@/constants/categoryPagesData.json";
import { notFound } from "next/navigation";

interface SubcategoryPageProps {
  params: { category: string; subcategory: string };
  searchParams: { page?: string };
}

// Generate metadata for SEO
export const generateMetadata = ({
  params,
}: SubcategoryPageProps): Metadata => {
  const categoryData = categoryPagesData.find(
    (cat) => cat.slug === params.category
  );

  if (!categoryData) {
    return {
      title: "دسته بندی پیدا نشد",
      description: "این دسته بندی وجود ندارد.",
    };
  }

  const subCategoryData = categoryData.subCategories?.find(
    (subCat) => subCat.slug === params.subcategory
  );

  if (!subCategoryData) {
    return {
      title: "زیر دسته بندی پیدا نشد",
      description: "زیر دسته بندی وجود ندارد.",
    };
  }

  return {
    title: `${subCategoryData.subCategory} | فرابک`,
    description: `مشاهده محصولات در ${subCategoryData.subCategory} | فرابک`,
  };
};

const SubcategoryPage = async ({
  params,
  searchParams,
}: SubcategoryPageProps) => {
  const { category, subcategory } = params;

  // Find the matching category
  const categoryData = categoryPagesData.find((cat) => cat.slug === category);

  if (!categoryData) {
    notFound();
  }

  // Find the subcategory within the selected category
  const subCategoryData = categoryData?.subCategories?.find((subCat) => {
    const isMatch = subCat.slug.toLowerCase() === subcategory.toLowerCase();
    if (!isMatch) {
    }
    return isMatch;
  });

  if (!subCategoryData) {
    notFound();
  }

  const currentPage = parseInt(searchParams.page || "1", 10);
  const limit = 30;

  const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductsBySubcategory/${subCategoryData.id}?page=${currentPage}&limit=${limit}`;

  const breadcrumbs = [
    { path: "/", href: "/" },
    { path: "/products", href: "/products" },
    {
      path: `/products/${categoryData.slug}`,
      href: `/products/${categoryData.slug}`,
    },
    {
      path: `/products/${categoryData.slug}/${subCategoryData.slug}`,
      href: `/products/${categoryData.slug}/${subCategoryData.slug}`,
    },
  ];

  return (
    <div>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <ProductGrid
        title={subCategoryData.subCategory}
        apiUrl={apiUrl}
        currentPage={currentPage}
        categorySlug={categoryData.slug}
        subcategorySlug={subCategoryData.slug}
      />
    </div>
  );
};

export default SubcategoryPage;
