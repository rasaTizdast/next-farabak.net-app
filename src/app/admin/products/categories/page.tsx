"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";

import CategoryTable from "./components/CategoryTable";
import CreateNewItem from "./components/CreateNewItem";
import { Category } from "./types/types";

const ProductCategories = () => {
  // State to manage categories and loading state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch categories when the component mounts
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/categories/getAll`);
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
