"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { BiTrash } from "react-icons/bi";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";
import { generateSlug } from "@/utils/generateSlug";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface BlogCategoryManagerProps {
  selectedCategoryIds: number[];
  onSelectedCategoryIdsChange: (ids: number[]) => void;
}

const BlogCategoryManager: React.FC<BlogCategoryManagerProps> = ({
  selectedCategoryIds,
  onSelectedCategoryIdsChange,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
  });
  const [confirmationModalData, setConfirmationModalData] = useState<{
    categoryId: number;
    categoryName: string;
    blogs: Array<{ id: number; title: string }>;
  } | null>(null);

  const categoriesInitializedRef = useRef(false);
  const { data: categoriesData } = useApiFetch<Category[]>("/api/blogs/categories");
  const { mutate: deleteCategoryMutate } = useApiMutation<Record<string, unknown>>("delete");
  const { mutate: createCategoryMutate } = useApiMutation<Record<string, unknown>, Category>(
    "post"
  );

  useEffect(() => {
    if (categoriesData && !categoriesInitializedRef.current) {
      categoriesInitializedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialize local editable categories state from fetched data once, guarded by ref.
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  const filteredCategories = useMemo(() => {
    if (categoryInput) {
      return categories.filter((category) =>
        category.name?.toLowerCase().includes(categoryInput.toLowerCase())
      );
    } else if (isInputFocused) {
      return categories;
    }
    return [];
  }, [categoryInput, categories, isInputFocused]);

  const addSelected = (categoryId: number) => {
    if (!selectedCategoryIds.includes(categoryId)) {
      onSelectedCategoryIdsChange([...selectedCategoryIds, categoryId]);
    }
  };

  const removeSelected = (categoryId: number) => {
    onSelectedCategoryIdsChange(selectedCategoryIds.filter((id) => id !== categoryId));
  };

  const handleForceCategoryDelete = async () => {
    if (!confirmationModalData) return;

    const res = await deleteCategoryMutate("/api/blogs/categories", {
      id: confirmationModalData.categoryId,
      force: true,
    });

    if (res) {
      setCategories((prev) => prev.filter((c) => c.id !== confirmationModalData.categoryId));
      removeSelected(confirmationModalData.categoryId);
      toast.success(`دسته بندی و ${confirmationModalData.blogs.length} بلاگ مرتبط با آن حذف شدند`);
      setConfirmationModalData(null);
    } else {
      toast.error("خطا در حذف دسته بندی");
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const res = await deleteCategoryMutate("/api/blogs/categories", { id: categoryId });

    if (res === null) {
      const blogsResponse = await fetch(`/api/blogs/categories/${categoryId}/blogs`);
      if (!blogsResponse.ok) {
        throw new Error(`HTTP ${blogsResponse.status}`);
      }
      const blogsUsingCategory = await blogsResponse.json();

      if (Array.isArray(blogsUsingCategory) && blogsUsingCategory.length > 0) {
        setConfirmationModalData({
          categoryId,
          categoryName: categories.find((c) => c.id === categoryId)?.name || "Category",
          blogs: blogsUsingCategory,
        });
        setShowDeleteConfirm(null);
        return;
      }

      toast.error("خطا در حذف دسته بندی");
      setShowDeleteConfirm(null);
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    removeSelected(categoryId);
    toast.success("دسته بندی با موفقیت حذف شد");
    setShowDeleteConfirm(null);
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast.error("نام دسته بندی الزامی است");
      return;
    }

    if (!newCategory.slug) {
      toast.error("شناسه دسته بندی الزامی است");
      return;
    }

    if (!/^[a-z0-9\-_]+$/.test(newCategory.slug)) {
      toast.error("شناسه فقط می‌تواند شامل حروف انگلیسی، اعداد، خط تیره و زیرخط باشد");
      return;
    }

    const createdCategory = await createCategoryMutate("/api/blogs/categories", newCategory);

    if (createdCategory) {
      setCategories((prev) => [...prev, createdCategory]);
      addSelected(createdCategory.id);
      setShowCreateModal(false);
      setNewCategory({ name: "", slug: "" });
      toast.success("دسته بندی با موفقیت ایجاد شد");
    } else {
      toast.error("خطا در ایجاد دسته بندی");
    }
  };

  const handleAddCategory = async (category: Category | string) => {
    if (typeof category === "string") {
      const createdCategory = await createCategoryMutate("/api/blogs/categories", {
        name: category,
      });

      if (createdCategory) {
        setCategories((prev) => [...prev, createdCategory]);
        addSelected(createdCategory.id);
      } else {
        toast.error("Error creating category. Please try again.");
      }
    } else {
      addSelected(category.id);
    }
    setCategoryInput("");
  };

  return (
    <div className="mt-4 md:col-span-2">
      <label htmlFor="blog-categories" className="mb-2 block text-sm font-medium">
        دسته بندی‌ها
      </label>
      <div className="relative">
        <input
          id="blog-categories"
          type="text"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          placeholder="جستجو یا افزودن دسته بندی..."
          aria-label="جستجو یا افزودن دسته بندی"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
          onFocus={() => setIsInputFocused(true)}
          onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
        />
        {(isInputFocused || categoryInput) && (
          <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-600 bg-gray-700">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="group flex items-center justify-between px-4 py-2 hover:bg-gray-600"
              >
                <button
                  type="button"
                  onClick={() => handleAddCategory(category)}
                  className="flex-grow text-right"
                >
                  {category.name}
                </button>
                <button
                  type="button"
                  aria-label="حذف دسته‌بندی"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(category.id);
                  }}
                  className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <BiTrash
                    size={20}
                    className="text-red-400 transition-colors hover:text-red-500"
                  />
                </button>
              </div>
            ))}

            {categoryInput && !categories.some((c) => c.name === categoryInput) && (
              <button
                type="button"
                onClick={() => {
                  setNewCategory({
                    name: categoryInput,
                    slug: generateSlug(categoryInput),
                  });
                  setShowCreateModal(true);
                }}
                className="w-full bg-blue-600 px-4 py-2 text-center hover:bg-blue-700"
              >
                ایجاد دسته بندی جدید
              </button>
            )}
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {selectedCategoryIds.map((categoryId) => {
          const category = categories.find((c) => c.id === categoryId);
          return (
            <button
              type="button"
              key={categoryId}
              onClick={() => removeSelected(categoryId)}
              className="flex items-center gap-1 rounded-lg bg-green-700 px-3 py-1 text-base transition-colors hover:cursor-pointer hover:bg-red-600"
              aria-label={`حذف دسته‌بندی ${category?.name || ""}`}
            >
              {category?.name || "Loading..."}
            </button>
          );
        })}
      </div>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-bold">حذف دسته بندی</h3>
            <p>آیا مطمئن هستید که می‌خواهید این دسته بندی را حذف کنید؟</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(showDeleteConfirm)}
                className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-bold">ایجاد دسته بندی جدید</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="category-name" className="mb-1 block text-sm font-medium">
                  نام
                </label>
                <input
                  id="category-name"
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  aria-label="نام دسته بندی"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2"
                  placeholder="نام دسته بندی"
                />
              </div>
              <div>
                <label htmlFor="category-slug" className="mb-1 block text-sm font-medium">
                  شناسه (فقط حروف انگلیسی، اعداد، خط تیره و زیرخط)
                </label>
                <input
                  id="category-slug"
                  type="text"
                  value={newCategory.slug}
                  onChange={(e) =>
                    setNewCategory((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ""),
                    }))
                  }
                  aria-label="شناسه دسته بندی"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2"
                  placeholder="مثال: my-category-name"
                  dir="ltr"
                />
                <span className="text-xs text-gray-400">
                  شناسه باید به انگلیسی باشد و فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد، خط تیره و
                  زیرخط باشد
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
                  disabled={
                    !newCategory.name ||
                    !newCategory.slug ||
                    !/^[a-z0-9\-_]+$/.test(newCategory.slug)
                  }
                >
                  ایجاد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {confirmationModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-96 rounded-lg bg-gray-800 p-6">
            <h3 className="mb-4 text-lg font-bold">هشدار: دسته بندی در حال استفاده</h3>
            <p>
              دسته بندی &quot;{confirmationModalData.categoryName}&quot; در{" "}
              {confirmationModalData.blogs.length} بلاگ استفاده شده است.
            </p>
            <div className="mt-4">
              <h4 className="mb-2 font-semibold">بلاگ‌های مرتبط:</h4>
              <ul className="max-h-40 overflow-y-auto rounded-lg bg-gray-700 p-2">
                {confirmationModalData.blogs.map((blog) => (
                  <li key={blog.id} className="border-b border-gray-600 py-1 last:border-b-0">
                    {blog.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmationModalData(null)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleForceCategoryDelete}
                className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
              >
                حذف دسته بندی و بلاگ‌های مرتبط
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogCategoryManager;
