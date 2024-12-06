type Product = {
  ProductId: number;
  Type: string;
  categorySlug: string;
  subCategorySlug: string;
  productSlug: string;
  Price: number;
  Available: boolean;
  link: string;
};

type Props = {
  page: number;
  setIsLoading: (isLoading: boolean) => void;
  setProducts: (products: Product[]) => void;
  setPagination: (
    updater: (prev: { totalPages: number; currentPage: number }) => {
      totalPages: number;
      currentPage: number;
    }
  ) => void;
  available?: "all" | "true" | "false";
  query?: string;
  filters?: {
    category: string;
    subCategory: string;
    available: boolean | null;
  };
};

// Utility function to check if filters have values
export const hasFilters = (filters: Props["filters"]): boolean => {
  if (!filters) return false;
  const { category, subCategory, available } = filters;
  return (
    (category && category.trim().length > 0) ||
    (subCategory && subCategory.trim().length > 0) ||
    available !== null
  );
};
