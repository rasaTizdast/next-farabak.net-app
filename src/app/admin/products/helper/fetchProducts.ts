import axios from "axios";
import toast from "react-hot-toast";
import { hasFilters } from "./hasFilters";

type Product = {
  ProductId: number;
  Type: string;
  categoryName: string;
  subCategoryName: string;
  productSlug: string;
  Price: number;
  Available: boolean;
  link: string;
  CategoryContentIds: {
    CategoryContentId: number;
    Name: string;
  }[];
};

type Props = {
  page: number;
  setIsLoading: (isLoading: boolean) => void;
  setProducts: (products: Product[]) => void;
  setNotFound: (arg0: boolean) => void;
  setPagination: (updater: { totalPages: number; currentPage: number }) => void;
  available?: "all" | "true" | "false";
  searchQuery?: string;
  filters?: {
    category: string;
    subCategory: string;
    available: boolean | null;
  };
};

// Fetch products function with loading state
const fetchProducts = async ({
  page,
  setIsLoading,
  setProducts,
  setPagination,
  setNotFound,
  searchQuery = "",
  filters,
}: Props) => {
  try {
    setIsLoading(true);
    setNotFound(false);

    // Base URL for the API
    let url = `/api/admin/products?page=${page}&limit=30`;

    // Add query parameter if it exists
    if (searchQuery.trim().length > 0) {
      url += `&q=${encodeURIComponent(searchQuery)}`;
    }

    // Add filters if they have values
    if (hasFilters(filters)) {
      const { category, subCategory, available } = filters!;
      if (category) url += `&category=${category}`;
      if (subCategory) url += `&subcategory=${subCategory}`;
      if (available !== null) url += `&available=${available}`;
    }

    // Fetch data
    const response = await axios.get(url);
    const { data, pagination } = response.data;

    setProducts(data); // Ensure `data` matches the `Product[]` type
    setPagination({
      totalPages: pagination.totalPages,
      currentPage: pagination.currentPage,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    toast.error("خطا در بارگذاری محصولات.");
    setNotFound(true);
  } finally {
    setIsLoading(false);
  }
};

export default fetchProducts;
