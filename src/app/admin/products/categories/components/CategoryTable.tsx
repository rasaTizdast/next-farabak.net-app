import React, { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

import { useApiMutation } from "@/hooks/useApiMutation";

import CategoryRow from "./CategoryRow";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import EditModal from "./EditModal";
import SubcategoryRow from "./SubcategoryRow";
import { Category, CategoryTableProps, SortKey, Subcategory } from "../types/types";

const SortableHeader = ({
  children,
  sortKey,
  sortConfig,
  onSort,
}: {
  children: React.ReactNode;
  sortKey: SortKey;
  sortConfig: { key: SortKey; direction: "ascending" | "descending" };
  onSort: (key: SortKey) => void;
}) => (
  <th
    className="px-6 py-3 text-gray-300 transition-colors hover:text-gray-100"
    onClick={() => onSort(sortKey)}
  >
    <div className="flex items-center justify-center gap-2">
      {children}
      {sortConfig.key === sortKey &&
        (sortConfig.direction === "ascending" ? (
          <FaSortUp aria-label="Sort ascending" />
        ) : (
          <FaSortDown aria-label="Sort descending" />
        ))}
      {sortConfig.key !== sortKey && <FaSort className="text-gray-400" />}
    </div>
  </th>
);

const CategoryTable = ({ categories, isLoading, refetchCategories }: CategoryTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  }>({ key: "Name", direction: "ascending" });

  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [editCategory, setEditCategory] = useState<Category | Subcategory | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [deleteItem, setDeleteItem] = useState<Category | Subcategory | null>(null);
  const [confirmationText, setConfirmationText] = useState(""); // State for the confirmation input

  const { mutate: deleteMutate } = useApiMutation("delete");

  // Sorting function
  const sortedCategories = useMemo(() => {
    if (!categories.length) return [];
    return categories.toSorted((a, b) => {
      const key = sortConfig.key;
      if (a[key] < b[key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [categories, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  const handleToggleExpand = (categoryId: number) => {
    setExpandedCategories((prevExpanded) => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  };

  const handleEditClick = (item: Category | Subcategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditCategory(item);
    setIsEditModalOpen(true); // Open the edit modal
  };

  const handleDeleteClick = (item: Category | Subcategory) => {
    setDeleteItem(item);
    setIsDeleteModalOpen(true); // Open the delete modal
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false); // Close the edit modal
    setIsDeleteModalOpen(false); // Close the delete modal
    setConfirmationText(""); // Clear the confirmation text
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    // Check if the user typed the correct name
    if (confirmationText !== deleteItem.Name) {
      toast.error("نام وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.");
      return;
    }

    const isCategoryItem = "CategoryID" in deleteItem && !("CategoryContentId" in deleteItem);

    const requestBody = {
      categoryId: isCategoryItem ? deleteItem.CategoryID : undefined,
      subCategoryId: !isCategoryItem ? deleteItem.CategoryContentId.toString() : undefined,
    };

    const result = await deleteMutate("/api/categories/delete", requestBody);
    if (result) {
      toast.success(
        `${isCategoryItem ? "دسته‌بندی" : "زیرمجموعه"} با موفقیت حذف شد، و محصولات مرتبط پاک شدند.`
      );
      refetchCategories();
      setDeleteItem(null);
      setIsDeleteModalOpen(false);
      setConfirmationText("");
    } else {
      toast.error("خطا در حذف، لطفاً دوباره تلاش کنید.");
    }
  };

  return (
    <>
      <div className="mt-10 flex flex-col items-center p-4">
        <div className="w-full max-w-[1800px] overflow-auto rounded-lg">
          <table className="w-full table-auto border-collapse border-spacing-0 overflow-hidden whitespace-nowrap rounded-xl text-center text-xs text-gray-100 lg:text-sm">
            <thead className="bg-slate-900 uppercase text-gray-100">
              <tr>
                <SortableHeader sortKey="Name" sortConfig={sortConfig} onSort={handleSort}>
                  دسته بندی
                </SortableHeader>
                <SortableHeader sortKey="Slug" sortConfig={sortConfig} onSort={handleSort}>
                  شناسه
                </SortableHeader>
                <SortableHeader sortKey="Available" sortConfig={sortConfig} onSort={handleSort}>
                  وضعیت
                </SortableHeader>
                <th scope="col" className="px-6 py-3">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? [...Array(20)].map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="bg-slate-700 px-6 py-4"></td>
                      <td className="bg-slate-700 px-6 py-4"></td>
                      <td className="bg-slate-700 px-6 py-4"></td>
                      <td className="bg-slate-700 px-6 py-4"></td>
                    </tr>
                  ))
                : sortedCategories.map((category, index) => (
                    <React.Fragment key={category.CategoryID}>
                      <CategoryRow
                        key={category.CategoryID}
                        category={category}
                        onDeleteClick={handleDeleteClick}
                        onEditClick={handleEditClick}
                        onToggleExpand={handleToggleExpand}
                        expandedCategories={expandedCategories}
                        index={index}
                      />
                      {expandedCategories.has(category.CategoryID) &&
                        category.Subcategories.map((subcategory, subIndex) => (
                          <SubcategoryRow
                            key={subcategory.CategoryContentId}
                            subcategory={subcategory}
                            onDeleteClick={handleDeleteClick}
                            onEditClick={handleEditClick}
                            subIndex={subIndex}
                          />
                        ))}
                    </React.Fragment>
                  ))}
            </tbody>
          </table>

          {/* Edit Modal */}
          <EditModal
            isOpen={isEditModalOpen}
            item={editCategory}
            onClose={handleModalClose}
            // onSave={handleItemUpdate}
            onChange={(updatedFields) =>
              setEditCategory((prev) => ({ ...prev!, ...updatedFields }))
            }
            refetchCategories={refetchCategories}
            setIsEditModalOpen={setIsEditModalOpen}
            setEditCategory={setEditCategory}
          />

          {/* Delete Modal */}
          <DeleteConfirmationModal
            isOpen={isDeleteModalOpen}
            item={deleteItem}
            onDeleteConfirm={handleDeleteConfirm}
            onClose={handleModalClose}
            confirmationText={confirmationText}
            setConfirmationText={setConfirmationText}
          />
        </div>
      </div>
    </>
  );
};

export default CategoryTable;
