import React from "react";
import toast from "react-hot-toast";

type ProductFormActionsProps = {
  onClose: () => void;
  hasFaqErrors: () => boolean;
};

const ProductFormActions: React.FC<ProductFormActionsProps> = ({ onClose, hasFaqErrors }) => {
  return (
    <div className="col-span-1 flex justify-end gap-6 sm:col-span-2">
      <button
        type="button"
        onClick={onClose}
        className="rounded bg-gray-500 px-4 py-2 transition-colors hover:bg-gray-600"
      >
        لغو
      </button>
      <button
        type="submit"
        className={`${
          hasFaqErrors() ? "cursor-not-allowed bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
        } rounded px-4 py-2 text-white transition-colors`}
        disabled={hasFaqErrors()}
        onClick={(e) => {
          if (hasFaqErrors()) {
            e.preventDefault();
            toast.error("لطفاً خطاهای سوالات متداول را برطرف کنید.");
          }
        }}
      >
        ذخیره
      </button>
    </div>
  );
};

export default ProductFormActions;
