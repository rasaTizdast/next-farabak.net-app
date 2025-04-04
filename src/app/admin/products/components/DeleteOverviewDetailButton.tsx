import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

type DeleteOverviewDetailButtonProps = {
  detailId: number;
  detailTitle: string;
  onSuccess: () => void;
};

const DeleteOverviewDetailButton = ({
  detailId,
  detailTitle,
  onSuccess,
}: DeleteOverviewDetailButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [inUseInfo, setInUseInfo] = useState<{
    isInUse: boolean;
    productsCount: number;
  }>({ isInUse: false, productsCount: 0 });

  const checkIfInUse = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `/api/productOverviewDetails/checkUsage/${detailId}`
      );
      setInUseInfo({
        isInUse: response.data.isInUse,
        productsCount: response.data.productsCount,
      });
      setShowConfirmModal(true);
    } catch (error) {
      toast.error("بررسی وضعیت استفاده با خطا مواجه شد");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/productOverviewDetails/delete/${detailId}`);
      toast.success("توضیحات محصول با موفقیت حذف شد");
      setShowConfirmModal(false);
      onSuccess(); // Refresh the list after deletion
    } catch (error) {
      toast.error("حذف توضیحات محصول با خطا مواجه شد");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={checkIfInUse}
        disabled={isLoading}
        className="py-1 px-3 bg-red-500 hover:bg-red-600 text-white rounded-md flex items-center gap-1"
      >
        <FiTrash2 size={16} />
        <span>حذف</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-500"
              disabled={isLoading}
            >
              <IoIosClose size={35} />
            </button>

            <h2 className="text-xl text-center font-bold mt-2 mb-4">
              حذف توضیحات محصول
            </h2>

            <p className="text-center mb-4">
              آیا از حذف توضیحات "{detailTitle}" اطمینان دارید؟
            </p>

            {inUseInfo.isInUse && (
              <div className="bg-yellow-600 bg-opacity-30 border border-yellow-500 rounded-lg p-3 mb-4">
                <p className="text-yellow-300 text-sm">
                  هشدار: این توضیحات در {inUseInfo.productsCount} محصول استفاده شده است.
                  حذف آن باعث حذف این ویژگی از تمام محصولات خواهد شد.
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="py-2 px-4 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
                disabled={isLoading}
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="py-2 px-4 bg-red-500 hover:bg-red-600 rounded-lg text-white flex items-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    <span>در حال حذف...</span>
                  </>
                ) : (
                  <>
                    <FiTrash2 size={16} />
                    <span>حذف</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteOverviewDetailButton; 