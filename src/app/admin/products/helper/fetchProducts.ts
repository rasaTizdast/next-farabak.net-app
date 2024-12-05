import axios from "axios";
import toast from "react-hot-toast";

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
  setFilteredProducts: (products: Product[]) => void;
  setPagination: (
    updater: (prev: { totalPages: number; currentPage: number }) => {
      totalPages: number;
      currentPage: number;
    }
  ) => void;
};

// Fetch products function with loading state
const fetchProducts = async ({
  page,
  setIsLoading,
  setProducts,
  setFilteredProducts,
  setPagination,
}: Props) => {
  try {
    setIsLoading(true);
    const response = await axios.get(
      `/api/products/getAllProducts?page=${page}&limit=30`
    );
    const { data, pagination } = response.data;
    const { totalPages } = pagination;

    setProducts(data); // Ensure `data` matches the `Product[]` type
    setFilteredProducts(data);
    setPagination((prev) => ({
      ...prev,
      totalPages,
    }));
  } catch (error) {
    console.error("Error fetching products:", error);
    toast.error("خطا در بارگذاری محصولات.");
  } finally {
    setIsLoading(false);
  }
};

export default fetchProducts;
