import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";

export const ImagePreview = ({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="relative max-h-[90vh] max-w-4xl">
      <img
        src={imageUrl}
        alt="پیش‌نمایش کامل"
        className="max-h-[90vh] max-w-full rounded-lg object-contain"
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute left-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/80"
        aria-label="بستن پیش‌نمایش"
      >
        <FiX className="h-6 w-6" />
      </button>
    </div>
  </div>
);

export const ConfirmationDialog = ({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
    <div className="animate-fadeIn w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-8 text-gray-200 shadow-xl">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-red-500/20 p-3">
          <FiAlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="mb-2 text-xl font-bold">آیا مطمئن هستید؟</h3>
        <p className="text-sm text-gray-400">
          این عملیات قابل بازگشت نیست و داده‌های حذف شده قابل بازیابی نخواهند بود.
        </p>
      </div>
      <div className="mt-2 flex justify-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-gray-700 px-5 py-2.5 font-medium transition-colors hover:bg-gray-600"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-700"
        >
          <FiTrash2 className="h-4 w-4" />
          تأیید حذف
        </button>
      </div>
    </div>
  </div>
);

export const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6" role="status" aria-label="در حال بارگذاری">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="rounded-lg bg-gray-800 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 rounded bg-gray-700" />
          <div className="h-4 w-20 rounded bg-gray-700" />
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center justify-between rounded-lg bg-gray-700 p-4">
              <div className="flex flex-1 items-center gap-4 space-x-4">
                <div className="h-20 w-32 rounded-lg bg-gray-600" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-600" />
                  <div className="h-3 w-1/2 rounded bg-gray-600" />
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-600" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);