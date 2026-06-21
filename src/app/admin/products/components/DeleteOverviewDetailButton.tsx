import { useState } from "react";
import { toast } from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

import { useApiMutation } from "@/hooks/useApiMutation";

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
  const { mutate: deleteDetail } = useApiMutation("delete");
  const [inUseInfo, setInUseInfo] = useState<{
    isInUse: boolean;
    productsCount: number;
  }>({ isInUse: false, productsCount: 0 });

  async function doCheckInUse(
    detailId: number,
    setIsLoading: (v: boolean) => void,
    setInUseInfo: (info: { isInUse: boolean; productsCount: number }) => void,
    setShowConfirmModal: (v: boolean) => void
  ) {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/productOverviewDetails/checkUsage/${detailId}`);
      if (response.ok) {
        const data = await response.json();
        setInUseInfo({ isInUse: data.isInUse, productsCount: data.productsCount });
      }
      setShowConfirmModal(true);
    } catch (error) {
      toast.error("بررسی وضعیت استفاده با خطا مواجه شد");
    } finally {
      setIsLoading(false);
    }
  }

  const checkIfInUse = async () => {
    await doCheckInUse(detailId, setIsLoading, setInUseInfo, setShowConfirmModal);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await deleteDetail(`/api/productOverviewDetails/delete/${detailId}`);
    if (res) {
      toast.success("توضیحات محصول با موفقیت حذف شد");
      setShowConfirmModal(false);
      onSuccess();
    } else {
      toast.error("حذف توضیحات محصول با خطا مواجه شد");
    }
    setIsLoading(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={checkIfInUse}
        disabled={isLoading}
        className="flex items-center gap-1 rounded-md bg-red-500 px-3 py-1 text-white hover:bg-red-600"
      >
        <FiTrash2 size={16} />
        <span>حذف</span>
      </button>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-lg bg-gray-800 p-6 text-white shadow-lg">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="absolute right-3 top-3 text-red-400 hover:text-red-500"
              disabled={isLoading}
            >
              <IoIosClose size={35} />
            </button>

            <h2 className="mb-4 mt-2 text-center text-xl font-bold">حذف توضیحات محصول</h2>

            <p className="mb-4 text-center">
              آیا از حذف توضیحات &quot;{detailTitle}&quot; اطمینان دارید؟
            </p>

            {inUseInfo.isInUse && (
              <div className="mb-4 rounded-lg border border-yellow-500 bg-yellow-600 bg-opacity-30 p-3">
                <p className="text-sm text-yellow-300">
                  هشدار: این توضیحات در {inUseInfo.productsCount} محصول استفاده شده است. حذف آن باعث
                  حذف این ویژگی از تمام محصولات خواهد شد.
                </p>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
                disabled={isLoading}
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
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
