type Props = {
  currentAction: {
    id: number | number[];
    type: "delete" | "bulk-delete" | "";
    name: string | string[];
  };
  handleModalConfirm: () => void;
  setIsModalOpen: (arg0: boolean) => void;
};

const ProductDeletionModal = ({
  currentAction,
  handleModalConfirm,
  setIsModalOpen,
}: Props) => {
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
        className={`relative rounded-lg shadow-lg p-8 max-w-md w-full animate-fade-in ${modalStyles}`}
      >
        {/* Close Button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 font-bold text-gray-900 hover:text-gray-600 focus:outline-none"
        >
          ✕
        </button>

        {/* Modal Header */}
        <p className="text-center text-lg font-medium text-gray-700 mb-4">
          {modalMessage()}
        </p>

        {/* Product List */}
        <div className="max-h-56 overflow-y-auto border rounded-lg p-4 bg-gray-50">
          {productNames.map((productName, index) => (
            <p
              key={index}
              className="text-sm text-gray-800 truncate hover:text-clip hover:whitespace-normal"
              title={typeof productName === "string" ? productName : ""}
            >
              {index + 1}. {productName}
            </p>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={handleModalConfirm}
            className={`px-6 py-2 text-white rounded-lg focus:outline-none transition-all ${buttonStyles}`}
          >
            تایید
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className={`px-6 py-2 text-gray-800 rounded-lg focus:outline-none transition-all ${cancelButtonStyles}`}
          >
            لغو
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDeletionModal; 