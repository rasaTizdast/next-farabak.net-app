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

  const modalStyles =
    currentAction.type === "delete" || currentAction.type === "bulk-delete"
      ? "bg-red-100 border-red-500"
      : "bg-white";

  const buttonStyles =
    currentAction.type === "delete" || currentAction.type === "bulk-delete"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

  const cancelButtonStyles =
    currentAction.type === "delete" || currentAction.type === "bulk-delete"
      ? "bg-gray-600 hover:bg-gray-700 focus:ring-gray-400 text-white"
      : "bg-gray-600 hover:bg-gray-700 focus:ring-gray-400 text-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
      <div
        className={`relative w-full max-w-md animate-fade-in rounded-lg p-8 shadow-lg ${modalStyles}`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute right-4 top-4 font-bold text-gray-900 hover:text-gray-600 focus:outline-none"
        >
          ✕
        </button>

        {/* Modal Header */}
        <p className="mb-4 text-center text-lg font-medium text-gray-700">{modalMessage()}</p>

        {/* Product List */}
        <div className="max-h-56 overflow-y-auto rounded-lg border bg-gray-50 p-4">
          {productNames.map((productName, index) => (
            <p
              key={index}
              className="truncate text-sm text-gray-800 hover:text-clip hover:whitespace-normal"
              title={typeof productName === "string" ? productName : ""}
            >
              {index + 1}. {productName}
            </p>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={handleModalConfirm}
            className={`rounded-lg px-6 py-2 text-white transition-all focus:outline-none ${buttonStyles}`}
          >
            تایید
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className={`rounded-lg px-6 py-2 text-gray-800 transition-all focus:outline-none ${cancelButtonStyles}`}
          >
            لغو
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDeletionModal;
