import React, { useId } from "react";

import { useModalA11y } from "@/hooks/useModalA11y";

import { Category, Subcategory } from "../types/types";

type DeleteConfirmationModalProps = {
  isOpen: boolean;
  item: Category | Subcategory | null;
  onDeleteConfirm: () => void;
  onClose: () => void;
  confirmationText: string;
  setConfirmationText: (text: string) => void;
  isDeleting: boolean;
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  item,
  onDeleteConfirm,
  onClose,
  confirmationText,
  setConfirmationText,
  isDeleting,
}) => {
  if (!isOpen || !item) return null;

  return (
    <DeleteConfirmationPanel
      item={item}
      onDeleteConfirm={onDeleteConfirm}
      onClose={onClose}
      confirmationText={confirmationText}
      setConfirmationText={setConfirmationText}
      isDeleting={isDeleting}
    />
  );
};

const DeleteConfirmationPanel: React.FC<Omit<DeleteConfirmationModalProps, "isOpen">> = ({
  item,
  onDeleteConfirm,
  onClose,
  confirmationText,
  setConfirmationText,
  isDeleting,
}) => {
  const titleId = useId();
  const inputId = useId();
  const panelRef = useModalA11y<HTMLDivElement>({
    onClose,
    shouldCloseOnEscape: () => !isDeleting,
  });

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={`${titleId}-description`}
        tabIndex={-1}
        className="w-[calc(100%-2rem)] max-w-96 rounded-xl bg-gray-800 p-6 text-white focus:outline-none"
      >
        <h2 id={titleId} className="text-center text-lg font-semibold">
          حذف {item.Name} را تأیید کنید
        </h2>
        <p id={`${titleId}-description`} className="mt-4 text-center">
          برای حذف {item.Name} و تمام محصولات مرتبط، لطفاً نام آن را وارد کنید:
        </p>
        <label htmlFor={inputId} className="sr-only">
          نام {item.Name} را برای تأیید حذف وارد کنید
        </label>
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          disabled={isDeleting}
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          className="mt-4 w-full rounded border border-gray-900 bg-gray-700 px-4 py-2"
          placeholder="نام را وارد کنید"
        />
        <div className="mt-6 flex justify-around">
          <button
            type="button"
            onClick={onDeleteConfirm}
            disabled={isDeleting}
            className="min-h-11 rounded bg-red-700 px-4 py-2 text-white transition-colors hover:bg-red-800 disabled:cursor-wait disabled:opacity-60"
          >
            {isDeleting ? "در حال حذف…" : "بله، حذف کن"}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="min-h-11 rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600 disabled:cursor-wait disabled:opacity-60"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
