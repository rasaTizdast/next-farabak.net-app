import React, { useState, useMemo } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

import DeleteConfirmationModal from "./DeleteConfirmationModal";
import CategoryRow from "./CategoryRow";
import SubcategoryRow from "./SubcategoryRow";
import EditModal from "./EditModal";

import {
  Category,
  CategoryTableProps,
  SortKey,
  Subcategory,
} from "../types/types";

const CategoryTable = ({
  categories,
  isLoading,
  refetchCategories,
}: CategoryTableProps) => {
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  }>({ key: "Name", direction: "ascending" });

  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [editCategory, setEditCategory] = useState<
    Category | Subcategory | null
  >(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [deleteItem, setDeleteItem] = useState<Category | Subcategory | null>(
    null
  );
  const [confirmationText, setConfirmationText] = useState(""); // State for the confirmation input

  // Sorting function
  const sortedCategories = useMemo(() => {
    if (!categories.length) return [];
    return [...categories].sort((a, b) => {
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
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
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

  const handleEditClick = (
    item: Category | Subcategory,
    e: React.MouseEvent
  ) => {
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

  const handleItemUpdate = async (updatedItem: Category | Subcategory) => {
    const isCategory =
      "CategoryID" in updatedItem && !("CategoryContentId" in updatedItem);
    const endpoint = `/api/categories/editCategory`;
    const payload = isCategory
      ? {
          Type: "category",
          CategoryID: updatedItem.CategoryID,
          Name: updatedItem.Name,
          Slug: updatedItem.Slug,
          Available: updatedItem.Available,
          SEO_Details: {
            SEO_Title: updatedItem.SEO_Details.SEO_Title,
            SEO_Description: updatedItem.SEO_Details.SEO_Description,
            SEO_Keywords: updatedItem.SEO_Details.SEO_Keywords,
          },
        }
      : {
          Type: "subcategory",
          CategoryContentId: updatedItem.CategoryContentId,
          CategoryID: updatedItem.CategoryID,
          Name: updatedItem.Name,
          Slug: updatedItem.Slug,
          Available: updatedItem.Available,
          SEO_Details: {
            SEO_Title: updatedItem.SEO_Details.SEO_Title,
            SEO_Description: updatedItem.SEO_Details.SEO_Description,
            SEO_Keywords: updatedItem.SEO_Details.SEO_Keywords,
          },
        };

    try {
      await axios.patch(endpoint, payload);
      toast.success("تغییرات با موفقیت اعمال شدند!");
      refetchCategories();
      setEditCategory(null);
      setIsEditModalOpen(false);
    } catch (error) {
      toast.error("خطا در بروزرسانی، لطفا مجددا تلاش کنید.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteItem) return;
    // Check if the user typed the correct name
    if (confirmationText !== deleteItem.Name) {
      toast.error("نام وارد شده صحیح نیست. لطفاً دوباره تلاش کنید.");
      return;
    }

    const isCategoryItem =
      "CategoryID" in deleteItem && !("CategoryContentId" in deleteItem);

    const requestBody = {
      categoryId: isCategoryItem ? deleteItem.CategoryID : undefined,
      subCategoryId: !isCategoryItem
        ? deleteItem.CategoryContentId.toString()
        : undefined,
    };

    try {
      await axios.delete("/api/categories/delete", { data: requestBody });
      toast.success(
        `${
          isCategoryItem ? "دسته‌بندی" : "زیرمجموعه"
        } با موفقیت حذف شد، و محصولات مرتبط پاک شدند.`
      );
      refetchCategories();
      setDeleteItem(null); // Reset the delete item state
      setIsDeleteModalOpen(false); // Close the modal
      setConfirmationText(""); // Clear the confirmation text
    } catch (error) {
      toast.error("خطا در حذف، لطفاً دوباره تلاش کنید.");
    }
  };

  const SortableHeader = ({
    children,
    sortKey,
  }: {
    children: React.ReactNode;
    sortKey: SortKey;
  }) => (
    <th
      className="px-6 py-3 text-gray-300 hover:text-gray-100 transition-colors"
      onClick={() => handleSort(sortKey)}
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

  return (
    <>
      <div className="flex flex-col items-center mt-10 overflow-x-auto">
        <table className="w-full overflow-hidden rounded-xl text-xs lg:text-sm text-center text-gray-300 table-auto border-spacing-0 border-separate max-w-[1800px]">
          <thead className="text-gray-100 uppercase bg-slate-900">
            <tr>
              <SortableHeader sortKey="Name">دسته بندی</SortableHeader>
              <SortableHeader sortKey="Slug">شناسه</SortableHeader>
              <SortableHeader sortKey="Available">وضعیت</SortableHeader>
              <th scope="col" className="px-6 py-3">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(20)].map((_, index) => (
                  <tr key={index} className="animate-pulse">
                    <td className="px-6 py-4 bg-slate-700"></td>
                    <td className="px-6 py-4 bg-slate-700"></td>
                    <td className="px-6 py-4 bg-slate-700"></td>
                    <td className="px-6 py-4 bg-slate-700"></td>
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
          onSave={handleItemUpdate}
          onChange={(updatedFields) =>
            setEditCategory((prev) => ({ ...prev!, ...updatedFields }))
          }
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
    </>
  );
};

export default CategoryTable;
