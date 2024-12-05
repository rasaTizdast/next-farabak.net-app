type Props = {
  currentAction: {
    id: number;
    type: string;
    name: string;
  };
  handleModalConfirm: () => void;
  setIsModalOpen: (arg0: boolean) => void;
};

const Modal = ({
  currentAction,
  handleModalConfirm,
  setIsModalOpen,
}: Props) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`bg-white rounded-lg p-6 w-[300px] ${
          currentAction.type === "delete" ? "border-red-600 border-2" : ""
        }`}
      >
        <p className="text-center text-lg">
          {currentAction.type === "delete" ? (
            <span>
              آیا می‌خواهید محصول{" "}
              <span className="font-bold text-red-600">
                {currentAction.name}
              </span>{" "}
              را حذف کنید؟
            </span>
          ) : (
            <span>
              آیا می‌خواهید وضعیت موجودی محصول{" "}
              <span className="font-bold text-blue-600">
                {currentAction.name}
              </span>{" "}
              را تغییر دهید؟
            </span>
          )}
        </p>
        <div className="flex justify-between mt-4">
          <button
            onClick={handleModalConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            تایید
          </button>
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            لغو
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
