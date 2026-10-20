import Link from "next/link";
import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

import { Category } from "../types/types";

type CategoryRowProps = {
  category: Category;
  onDeleteClick: (category: Category) => void;
  onEditClick: (category: Category, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onToggleExpand: (categoryId: number) => void;
  expandedCategories: Set<number>;
  index: number;
};

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  onDeleteClick,
  onEditClick,
  onToggleExpand,
  expandedCategories,
  index,
}) => (
  <tr
    className={`${
      expandedCategories.has(category.CategoryID)
        ? "bg-blue-950"
        : index % 2 === 0
          ? "bg-slate-700"
          : "bg-slate-600"
    } transition-colors duration-300 ease-in-out hover:bg-blue-950`}
  >
    <td className="px-6 py-4 font-medium text-white">{category.Name}</td>
    <td className="px-6 py-4 font-medium text-gray-300">{category.Slug}</td>
    <td className="px-6 py-4 text-gray-300">{category.Available ? "موجود" : "ناموجود"}</td>
    <td className="px-6 py-4">
      <div className="flex items-center justify-center gap-2">
        <Link
          href={category.Link}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-blue-600 px-5 py-2 text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
        >
          مشاهده
        </Link>
        <button
          type="button"
          onClick={(e) => onEditClick(category, e)}
          className="flex min-h-11 items-center justify-center gap-1 rounded bg-yellow-600 px-5 py-2 text-white transition-colors hover:bg-yellow-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
        >
          ویرایش
          <FaEdit />
        </button>
        <button
          type="button"
          onClick={() => onDeleteClick(category)}
          className="flex min-h-11 items-center gap-1 rounded bg-red-600 px-5 py-2 text-white transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
        >
          حذف
          <FaTrash className="mb-1" />
        </button>
        <button
          type="button"
          onClick={() => onToggleExpand(category.CategoryID)}
          className={`min-h-11 rounded bg-green-600 px-5 py-2 text-white transition-colors hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none ${
            !category.Subcategories.length ? "cursor-not-allowed opacity-30" : ""
          }`}
          disabled={!category.Subcategories.length}
        >
          {expandedCategories.has(category.CategoryID) ? "بستن" : "مشاهده زیردسته‌بندی"}
        </button>
      </div>
    </td>
  </tr>
);

export default CategoryRow;
