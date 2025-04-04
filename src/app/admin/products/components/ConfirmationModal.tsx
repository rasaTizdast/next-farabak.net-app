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
  const productNames = Array.isArray(action.name)
    ? action.name
    : [action.name];

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalMessage()}
      size="md"
    >
      {/* Product List */}
      <div className="max-h-56 overflow-y-auto border border-gray-700 rounded-lg p-4 bg-gray-900">
        {productNames.map((productName, index) => (
          <p
            key={index}
            className="text-sm text-gray-300 truncate hover:text-clip hover:whitespace-normal"
            title={typeof productName === "string" ? productName : ""}
          >
            {index + 1}. {productName}
          </p>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={onConfirm}
          className={`px-6 py-2 text-white rounded-lg focus:outline-none transition-all ${
            isDangerAction
              ? "bg-red-600 hover:bg-red-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          تایید
        </button>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg focus:outline-none transition-all"
        >
          لغو
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmationModal; 