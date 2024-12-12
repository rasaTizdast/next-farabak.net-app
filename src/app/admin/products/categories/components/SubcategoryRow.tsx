import { FaEdit, FaTrash } from "react-icons/fa";
import Link from "next/link";

import { Subcategory } from "../types/types";

type SubcategoryRowProps = {
  subcategory: Subcategory;
  onDeleteClick: (subcategory: Subcategory) => void;
  onEditClick: (
    subcategory: Subcategory,
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  subIndex: number;
};

const SubcategoryRow: React.FC<SubcategoryRowProps> = ({
  subcategory,
  onDeleteClick,
  onEditClick,
  subIndex,
}) => (
  <tr
    key={subcategory.CategoryContentId}
    className={`${
      subIndex % 2 === 0 ? "bg-slate-900" : "bg-slate-800"
    } hover:bg-sky-900 transition-all duration-200`}
  >
    <td className="px-12 py-4 text-white">{subcategory.Name}</td>
    <td className="px-12 py-4 text-gray-300">{subcategory.Slug}</td>
    <td className="px-6 py-4 text-gray-300">
      {subcategory.Available ? "موجود" : "ناموجود"}
    </td>
    <td className="px-6 py-4 flex gap-2 justify-center">
      <Link href={subcategory.Link} target="_blank">
        <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 transition-all">
          مشاهده
        </button>
      </Link>
      <button
        onClick={(e) => onEditClick(subcategory, e)}
        className="flex items-center justify-center gap-1 bg-yellow-600 text-white px-5 py-2 rounded hover:bg-yellow-700 transition-all"
      >
        ویرایش
        <FaEdit />
      </button>
      <button
        onClick={() => onDeleteClick(subcategory)}
        className="flex gap-1 items-center bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700 transition-all"
      >
        حذف
        <FaTrash className="mb-1" />
      </button>
    </td>
  </tr>
);

export default SubcategoryRow;
