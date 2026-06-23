import Link from "next/link";
import { FaEdit, FaTrash } from "react-icons/fa";

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
    } transition-all duration-200 hover:bg-sky-900`}
  >
    <td className="px-12 py-4 text-white">{subcategory.Name}</td>
    <td className="px-12 py-4 text-gray-300">{subcategory.Slug}</td>
    <td className="px-6 py-4 text-gray-300">{subcategory.Available ? "موجود" : "ناموجود"}</td>
    <td className="flex justify-center gap-2 px-6 py-4">
      <Link href={subcategory.Link} target="_blank">
        <button
          type="button"
          className="rounded bg-blue-600 px-5 py-2 text-white transition-all hover:bg-blue-700"
        >
          مشاهده
        </button>
      </Link>
      <button
        type="button"
        onClick={(e) => onEditClick(subcategory, e)}
        className="flex items-center justify-center gap-1 rounded bg-yellow-600 px-5 py-2 text-white transition-all hover:bg-yellow-700"
      >
        ویرایش
        <FaEdit />
      </button>
      <button
        type="button"
        onClick={() => onDeleteClick(subcategory)}
        className="flex items-center gap-1 rounded bg-red-600 px-5 py-2 text-white transition-all hover:bg-red-700"
      >
        حذف
        <FaTrash className="mb-1" />
      </button>
    </td>
  </tr>
);

export default SubcategoryRow;
