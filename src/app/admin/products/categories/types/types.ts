// Subcategory type
export interface Subcategory {
  CategoryContentId: number;
  Name: string;
  CategoryID: number;
  Slug: string;
  Available: boolean;
  Link: string;
  TopBlog?: string | null;
  BottomBlog?: string | null;
  SEO_Details: {
    SEO_Title: string;
    SEO_Description: string;
    SEO_Keywords: string[];
  };
}

// Category type
export interface Category {
  CategoryID: number;
  Name: string;
  Available: boolean;
  Slug: string;
  Link: string;
  Subcategories: Subcategory[];
  TopBlog?: string | null;
  BottomBlog?: string | null;
  SEO_Details: {
    SEO_Title: string;
    SEO_Description: string;
    SEO_Keywords: string[];
  };
}

export interface CategoryTableProps {
  categories: Category[];
  isLoading: boolean;
  refetchCategories: () => void;
}

export type SortKey = keyof Pick<Category, "Name" | "Available" | "Slug">;
