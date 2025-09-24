import React from "react";

import { Category, Subcategory } from "../types/types";

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  item: Category | Subcategory | null;
  onDeleteConfirm: () => void;
  onClose: () => void;
  confirmationText: string;
  setConfirmationText: (text: string) => void;
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  item,
  onDeleteConfirm,
  onClose,
  confirmationText,
  setConfirmationText,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-96 rounded-xl bg-gray-800 p-6 text-white">
        <h2 className="text-center text-lg font-semibold">حذف {item.Name} را تأیید کنید</h2>
        <p className="mt-4 text-center">
          برای حذف {item.Name} و تمام محصولات مرتبط، لطفاً نام آن را وارد کنید:
        </p>
        <input
          type="text"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          className="mt-4 w-full rounded border border-gray-900 bg-gray-700 px-4 py-2"
          placeholder="نام را وارد کنید"
        />
        <div className="mt-6 flex justify-around">
          <button
            onClick={onDeleteConfirm}
            className="rounded bg-red-700 px-4 py-2 text-white transition-all hover:bg-red-800"
          >
            بله، حذف کن
          </button>
          <button
            onClick={onClose}
            className="rounded bg-gray-500 px-4 py-2 text-white transition-all hover:bg-gray-600"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
