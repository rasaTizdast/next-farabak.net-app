import { Category, Subcategory } from "../types/types";

interface EditModalProps {
  isOpen: boolean;
  item: Category | Subcategory | null;
  onClose: () => void;
  onSave: (updatedItem: Category | Subcategory) => void;
  onChange: (updatedFields: Partial<Category | Subcategory>) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  onChange,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-xl mb-4">ویرایش</h3>
        <div className="mb-4">
          <label className="block text-sm mb-2">نام</label>
          <input
            type="text"
            value={item.Name}
            onChange={(e) => onChange({ Name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-2">شناسه</label>
          <input
            type="text"
            value={item.Slug}
            onChange={(e) => onChange({ Slug: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-2">وضعیت</label>
          <select
            value={item.Available ? "available" : "unavailable"}
            onChange={(e) =>
              onChange({ Available: e.target.value === "available" })
            }
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="available">موجود</option>
            <option value="unavailable">ناموجود</option>
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            بستن
          </button>
          <button
            onClick={() => onSave(item)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ذخیره تغییرات
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
