import React, { useState } from "react";
import { Category, Subcategory } from "../types/types";

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  item: Category | Subcategory | null;
  onDeleteConfirm: () => void;
  onClose: () => void;
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  item,
  onDeleteConfirm,
  onClose,
}) => {
  const [confirmationText, setConfirmationText] = useState("");

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-lg font-semibold text-center">
          حذف {item.Name} را تأیید کنید
        </h2>
        <p className="text-center mt-4">
          برای حذف {item.Name} و تمام محصولات مرتبط، لطفاً نام آن را وارد کنید:
        </p>
        <input
          type="text"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          className="mt-4 w-full px-4 py-2 border border-gray-300 rounded"
          placeholder="نام را وارد کنید"
        />
        <div className="mt-6 flex justify-around">
          <button
            onClick={onDeleteConfirm}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-all"
          >
            بله، حذف کن
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-all"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
