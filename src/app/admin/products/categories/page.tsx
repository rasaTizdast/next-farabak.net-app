"use client";

import { Toaster } from "react-hot-toast";

import { useApiFetch } from "@/hooks/useApiFetch";

import CategoryTable from "./components/CategoryTable";
import CreateNewItem from "./components/CreateNewItem";
import { Category } from "./types/types";

const ProductCategories = () => {
  const {
    data: categoriesData,
    loading: isLoading,
    refetch: fetchCategories,
  } = useApiFetch<Category[]>("/api/categories/getAll");
  const categories = categoriesData || [];

  return (
    <>
      <Toaster position="bottom-center" />
      <header className="mb-6">
        <h1 className="text-xl font-bold text-white sm:text-2xl">مدیریت دسته‌بندی‌ها</h1>
        <p className="text-sm text-gray-300">
          از اینجا می‌توانید دسته‌بندی‌ها و زیردسته‌ها را مدیریت کنید
        </p>
      </header>
      <div className="flex w-full flex-col gap-6">
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
      </div>
    </>
  );
};

export default ProductCategories;
