"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useApiFetch } from "@/hooks/useApiFetch";

import CategoryTable from "./components/CategoryTable";
import CreateNewItem from "./components/CreateNewItem";
import { Category } from "./types/types";

const ProductCategories = () => {
  const { data: categoriesData, loading: isLoading, refetch: fetchCategories } = useApiFetch<Category[]>("/api/categories/getAll");
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  return (
    <>
      <Toaster position="bottom-center" />
      <CreateNewItem
        refetchCategories={fetchCategories}
        isLoading={isLoading}
        categories={categories}
      />

      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        refetchCategories={fetchCategories} // Pass refetch function
      />
    </>
  );
};

export default ProductCategories;
