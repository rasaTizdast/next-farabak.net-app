import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";

import { Category } from "../types/types";

type CategoryRowProps = {
  category: Category;
  onDeleteClick: (category: Category) => void;
  onEditClick: (
    category: Category,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
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
    } hover:bg-blue-950 transition-all duration-300 ease-in-out`}
  >
    <td className="px-6 py-4 font-medium text-white">{category.Name}</td>
    <td className="px-6 py-4 font-medium text-gray-300">{category.Slug}</td>
    <td className="px-6 py-4 text-gray-300">
      {category.Available ? "موجود" : "ناموجود"}
    </td>
    <td className="px-6 py-4 flex gap-2 w-full items-center justify-center">
      <Link href={category.Link} target="_blank">
        <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition-all">
          مشاهده
        </button>
      </Link>
      <button
        onClick={(e) => onEditClick(category, e)}
        className="flex items-center justify-center gap-1 bg-yellow-600 text-white px-5 py-2 rounded hover:bg-yellow-700 transition-all"
      >
        ویرایش
        <FaEdit />
      </button>
      <button
        onClick={() => onDeleteClick(category)}
        className="flex gap-1 items-center bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition-all"
      >
        حذف
        <FaTrash className="mb-1" />
      </button>
      <button
        onClick={() => onToggleExpand(category.CategoryID)}
        className={`bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 transition-all ${
          !category.Subcategories.length ? "opacity-30 cursor-not-allowed" : ""
        }`}
        disabled={!category.Subcategories.length}
      >
        {expandedCategories.has(category.CategoryID) ? "بستن" : "نمایش"}
      </button>
    </td>
  </tr>
);

export default CategoryRow;
