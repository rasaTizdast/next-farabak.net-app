import React, { useEffect, useId, useRef } from "react";

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
    <DeleteConfirmationPanel
      item={item}
      onDeleteConfirm={onDeleteConfirm}
      onClose={onClose}
      confirmationText={confirmationText}
      setConfirmationText={setConfirmationText}
    />
  );
};

const DeleteConfirmationPanel: React.FC<Omit<DeleteConfirmationModalProps, "isOpen">> = ({
  item,
  onDeleteConfirm,
  onClose,
  confirmationText,
  setConfirmationText,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const inputId = useId();

  useEffect(() => {
    panelRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black backdrop-blur-sm">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-[calc(100%-2rem)] max-w-96 rounded-xl bg-gray-800 p-6 text-white focus:outline-none"
      >
        <h2 id={titleId} className="text-center text-lg font-semibold">
          حذف {item.Name} را تأیید کنید
        </h2>
        <p className="mt-4 text-center">
          برای حذف {item.Name} و تمام محصولات مرتبط، لطفاً نام آن را وارد کنید:
        </p>
        <label htmlFor={inputId} className="sr-only">
          نام {item.Name} را برای تأیید حذف وارد کنید
        </label>
        <input
          id={inputId}
          type="text"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          className="mt-4 w-full rounded border border-gray-900 bg-gray-700 px-4 py-2"
          placeholder="نام را وارد کنید"
        />
        <div className="mt-6 flex justify-around">
          <button
            type="button"
            onClick={onDeleteConfirm}
            className="rounded bg-red-700 px-4 py-2 text-white transition-colors hover:bg-red-800"
          >
            بله، حذف کن
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
          >
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
