// ProductsMegaMenu.tsx (Server Component)

import type { CategoryContent as PrismaCategoryContent } from "@prisma/client";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

// Category and Subcategory types
export interface Subcategory {
  CategoryContentId: number;
  Name: string;
  CategoryID: number;
  Slug: string;
  Available: boolean;
  Link: string;
  SEO_Details: {
    SEO_Title: string | null;
    SEO_Description: string | null;
    SEO_Keywords: string[] | null;
  };
}

export interface Category {
  CategoryID: number;
  Name: string;
  Available: boolean;
  Slug: string;
  Link: string;
  Subcategories: Subcategory[];
  SEO_Details: {
    SEO_Title: string | null;
    SEO_Description: string | null;
    SEO_Keywords: string[] | null;
  };
}

interface RawCategory {
  CategoryID: number;
  Name: string | null;
  Available: boolean | null;
  Slug: string | null;
  SEO_Category: {
    SEO_Title: string | null;
    SEO_Description: string | null;
    SEO_Keywords: string | null;
  } | null;
  CategoryContent: (PrismaCategoryContent & {
    SEO_CategoryContent: {
      SEO_Title: string | null;
      SEO_Description: string | null;
      SEO_Keywords: string | null;
    } | null;
  })[];
}

// Fetch categories directly from the database to avoid network calls during SSG/ISR
async function fetchCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { CategoryID: "asc" },
      include: {
        SEO_Category: true,
        CategoryContent: {
          include: {
            SEO_CategoryContent: true,
          },
        },
      },
    });

    const categoriesWithSubcategoriesAndSEO = categories.map((category: RawCategory) => {
      const subcategoriesWithSEO = category.CategoryContent.map((sub) => {
        return {
          CategoryContentId: sub.CategoryContentId,
          Name: sub.Name ?? "",
          CategoryID: sub.CategoryID ?? 0,
          Slug: sub.Slug ?? "",
          Available: sub.Available ?? false,
          Link: `/products/${category.Slug ?? ""}/${sub.Slug ?? ""}`,
          SEO_Details: sub.SEO_CategoryContent
            ? {
                SEO_Title: sub.SEO_CategoryContent.SEO_Title,
                SEO_Description: sub.SEO_CategoryContent.SEO_Description,
                SEO_Keywords: sub.SEO_CategoryContent.SEO_Keywords
                  ? [sub.SEO_CategoryContent.SEO_Keywords]
                  : null,
              }
            : {
                SEO_Title: null,
                SEO_Description: null,
                SEO_Keywords: null,
              },
        };
      });

      return {
        CategoryID: category.CategoryID,
        Name: category.Name ?? "",
        Available: category.Available ?? false,
        Slug: category.Slug ?? "",
        Link: `/products/${category.Slug ?? ""}`,
        SEO_Details: category.SEO_Category
          ? {
              SEO_Title: category.SEO_Category.SEO_Title,
              SEO_Description: category.SEO_Category.SEO_Description,
              SEO_Keywords: category.SEO_Category.SEO_Keywords
                ? [category.SEO_Category.SEO_Keywords]
                : null,
            }
          : {
              SEO_Title: null,
              SEO_Description: null,
              SEO_Keywords: null,
            },
        Subcategories: subcategoriesWithSEO,
      };
    });

    // Filter only available categories
    return categoriesWithSubcategoriesAndSEO.filter((category) => category.Available);
  } catch (error) {
    // During build time or when DB/API is unavailable, return empty array
    console.error("Error fetching categories:", error);
    return [];
  }
}

const ProductsMegaMenu = async () => {
  const categories = await fetchCategories();

  // Separate categories into those with and without subcategories
  const categoriesWithSubcategories = categories.filter((category) =>
    category.Subcategories.some((subCategory) => subCategory.Available)
  );

  const categoriesWithoutSubcategories = categories.filter(
    (category) => category.Subcategories.length === 0
  );

  return (
    <li className="group relative">
      <Link
        href="/products"
        className="inline-block rounded-t-lg rounded-tr-lg px-4 py-2.5 text-[#ddd] transition-[background-color,padding-inline] duration-300 hover:bg-[#6363634d] hover:px-8 md:hover:px-6 lg:hover:px-4.5 xl:hover:px-8 2xl:hover:px-8"
      >
        محصولات
      </Link>

      <div className="absolute -start-[40%] top-full z-30 flex hidden max-h-[90dvh] w-[80vw] max-w-[1300px] -translate-x-1/2 flex-wrap justify-evenly gap-x-8 gap-y-6 overflow-y-auto rounded-br-lg rounded-bl-lg bg-white p-8 shadow-[0px_4px_8px_rgba(0,0,0,0.1)] group-hover:flex md:-start-[65%] md:w-[90vw] md:rounded-none md:p-8 lg:-start-[50%] lg:p-8 xl:-start-[60%] 2xl:-start-[40%]">
        {/* Categories with subcategories */}
        {categoriesWithSubcategories.map((category) => (
          <div
            key={category.CategoryID}
            className="min-w-[200px] flex-auto md:min-w-[200px] md:flex-[0_0_200px]"
          >
            <h3 className="mb-2 border-b-3 border-[#003262] pb-2 text-base">
              <Link
                href={category.Link}
                className="transition-colors duration-300 hover:text-[#1e90ff]"
              >
                {category.Name}
              </Link>
            </h3>
            <ul className="flex list-none flex-col gap-3">
              {category.Subcategories.reduce<React.JSX.Element[]>((acc, subCategory) => {
                if (subCategory.Available) {
                  acc.push(
                    <li key={subCategory.CategoryContentId} className="text-[0.9rem] font-medium">
                      <Link
                        href={subCategory.Link}
                        className="text-[#252525] transition-[color,padding-inline-end] duration-300 hover:pr-4 hover:text-[#007bff]"
                      >
                        {subCategory.Name}
                      </Link>
                    </li>
                  );
                }
                return acc;
              }, [])}
            </ul>
          </div>
        ))}

        {/* Categories without subcategories */}
        {categoriesWithoutSubcategories.length > 0 && (
          <div className="min-w-[200px] flex-auto md:min-w-[200px] md:flex-[0_0_200px]">
            <h3 className="mb-2 border-b-3 border-[#003262] pb-2 text-base">دیگر محصولات</h3>
            <ul className="flex list-none flex-col gap-3">
              {categoriesWithoutSubcategories.map((category) => (
                <li key={category.CategoryID} className="text-[0.9rem] font-medium">
                  <Link
                    href={category.Link}
                    className="text-[#252525] transition-[color,padding-inline-end] duration-300 hover:pr-4 hover:text-[#007bff]"
                  >
                    {category.Name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </li>
  );
};

export default ProductsMegaMenu;
