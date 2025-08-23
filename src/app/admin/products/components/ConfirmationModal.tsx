import React from "react";

import Modal from "./Modal";

type ConfirmationAction = {
  id: number | number[];
  type: "delete" | "bulk-delete" | "";
  name: string | string[];
};

type ConfirmationModalProps = {
  isOpen: boolean;
  action: ConfirmationAction;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  action,
  onConfirm,
  onClose,
}) => {
  const productNames = Array.isArray(action.name) ? action.name : [action.name];

  const modalMessage = () => {
    switch (action.type) {
      case "delete":
        return "آیا از حذف محصول زیر مطمئن هستید؟";
      case "bulk-delete":
        return "آیا از حذف محصولات زیر مطمئن هستید؟";
      default:
        return "عملیات انتخاب شده";
    }
  };

  const isDangerAction = action.type === "delete" || action.type === "bulk-delete";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalMessage()} size="md">
      {/* Product List */}
      <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-700 bg-gray-900 p-4">
        {productNames.map((productName, index) => (
          <p
            key={index}
            className="truncate text-sm text-gray-300 hover:text-clip hover:whitespace-normal"
            title={typeof productName === "string" ? productName : ""}
          >
            {index + 1}. {productName}
          </p>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={onConfirm}
          className={`rounded-lg px-6 py-2 text-white transition-all focus:outline-none ${
            isDangerAction ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          تایید
        </button>
        <button
          onClick={onClose}
          className="rounded-lg bg-gray-600 px-6 py-2 text-white transition-all hover:bg-gray-700 focus:outline-none"
        >
          لغو
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
