// Subcategory type
export interface Subcategory {
  CategoryContentId: number;
  Name: string;
  CategoryID: number;
  Slug: string;
  Available: boolean;
  Link: string;
}

// Category type
export interface Category {
  CategoryID: number;
  Name: string;
  Available: boolean;
  Slug: string;
  Link: string;
  Subcategories: Subcategory[];
}

export interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  refetchCategories: () => void;
}

export type SortKey = keyof Pick<Category, "Name" | "Available" | "Slug">;
