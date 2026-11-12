import { useId } from "react";

import { useModalA11y } from "@/hooks/useModalA11y";

type Props = {
  currentAction: {
    id: number | number[];
    type: "delete" | "bulk-delete" | "";
    name: string | string[];
  };
  handleModalConfirm: () => void;
  setIsModalOpen: (arg0: boolean) => void;
};

const ProductDeletionModal = ({ currentAction, handleModalConfirm, setIsModalOpen }: Props) => {
  const panelRef = useModalA11y<HTMLDivElement>({ onClose: () => setIsModalOpen(false) });
  const titleId = useId();

  const productNames = Array.isArray(currentAction.name)
    ? currentAction.name
    : [currentAction.name];

  const modalMessage = () => {
    switch (currentAction.type) {
      case "delete":
        return "آیا از حذف محصول زیر مطمئن هستید؟";
      case "bulk-delete":
        return "آیا از حذف محصولات زیر مطمئن هستید؟";
      default:
        return "عملیات انتخاب شده";
    }
  };

  const buttonStyles =
    currentAction.type === "delete" || currentAction.type === "bulk-delete"
      ? "bg-red-700 hover:bg-red-600"
      : "bg-blue-600 hover:bg-blue-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-3 backdrop-blur-[2px]"
      data-testid="delete-confirmation-modal"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-xl border border-slate-500 bg-slate-800 p-5 text-white shadow-2xl focus:outline-none sm:p-8"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          aria-label="بستن"
          className="absolute top-3 left-3 flex size-10 items-center justify-center rounded-lg text-slate-200 hover:bg-slate-700 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
        >
          ✕
        </button>

        {/* Modal Header */}
        <h2 id={titleId} className="mb-4 pe-8 text-center text-lg font-semibold text-white">
          {modalMessage()}
        </h2>

        {/* Product List */}
        <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-600 bg-slate-900 p-4">
          {productNames.map((productName, index) => (
            <p
              key={productName}
              className="truncate text-sm text-slate-100 hover:text-clip hover:whitespace-normal"
              title={typeof productName === "string" ? productName : ""}
            >
              {index + 1}. {productName}
            </p>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleModalConfirm}
            className={`min-h-11 rounded-lg px-6 py-2 text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none ${buttonStyles}`}
          >
            تایید
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="min-h-11 rounded-lg bg-slate-600 px-6 py-2 text-white transition-colors hover:bg-slate-500 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
          >
            لغو
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDeletionModal;
