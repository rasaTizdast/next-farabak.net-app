import { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Product } from "../types";
import { IoIosClose } from "react-icons/io";
import toast from "react-hot-toast"; // Importing react-hot-toast

type Props = {
  onClose: (arg0: boolean) => void;
  product: Product | null;
  refetchProducts: () => void;
};

const QrCodeModal = ({ onClose, product, refetchProducts }: Props) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [expiryDays, setExpiryDays] = useState<number | null>(2);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [uniqueQrCodeDetails, setUniqueQrCodeDetails] = useState<any>(null);

  const resetState = () => {
    setExpiryDays(2);
    setShowConfirmModal(false);
    setUniqueQrCodeDetails(null);
  };

  const generateUniqueKey = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  const calculateExpiryTimestamp = (days: number | null) => {
    if (!days) return null;
    const now = new Date();
    now.setDate(now.getDate() + days);
    return now.toISOString();
  };

  const fetchUniqueQrCodeDetails = async () => {
    if (!product || !product.QrCode_Key || !product.QrCode_expiryDays) return;

    const expiryDate = new Date(product.QrCode_expiryDays);
    const currentDate = new Date();
    const isExpired = currentDate > expiryDate;

    if (isExpired) {
      // Remove expired QR code details
      await deleteUniqueQrCode();
    } else {
      setUniqueQrCodeDetails({
        qrCodeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.link}?key=${product.QrCode_Key}`,
        expiryDate,
      });
    }
  };

  const deleteUniqueQrCode = async () => {
    if (!product) return;

    try {
      const response = await fetch("/api/products/qrCode", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.ProductId,
        }),
      });

      if (!response.ok) return;

      toast.success("کد QR یکتا با موفقیت حذف شد."); // Adding success toast notification

      onClose(false);
      refetchProducts();
    } catch (error) {
      toast.error("خطایی در ارتباط با سرور رخ داده است.");
    }
  };

  const generateUniqueQrCode = async () => {
    if (!product) return;

    setShowConfirmModal(false);

    const uniqueKey = generateUniqueKey();
    const expiry = calculateExpiryTimestamp(expiryDays);

    try {
      const response = await fetch("/api/products/qrCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.ProductId,
          qrCodeKey: uniqueKey,
          qrCodeExpiryDays: expiryDays === null ? "never" : expiry || "",
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error("خطایی در ذخیره اطلاعات کد QR رخ داده است.");
        return;
      }

      onClose(false);
      refetchProducts();
    } catch (error) {
      toast.error("خطایی در ارتباط با سرور رخ داده است.");
    }
  };

  const downloadQrCode = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      a.click();
    }
  };

  useEffect(() => {
    if (product) {
      fetchUniqueQrCodeDetails();
    }
  }, [product]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
      dir="rtl"
    >
      <div className="bg-gray-800 text-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90dvh] overflow-y-scroll relative animate-fade-in">
        <button
          onClick={() => {
            onClose(false);
            resetState();
          }}
          className="absolute top-4 right-4 text-red-400 hover:text-red-500 transition-all"
        >
          <IoIosClose size={50} />
        </button>
        <h1 className="text-xl text-center font-bold mb-10">تولید کد QR</h1>

        {/* Normal QR Code */}
        <div className="mb-6">
          <button
            onClick={() => {
              setQrCodeUrl(
                `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.link}`
              );
            }}
            className="w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-500"
            disabled={uniqueQrCodeDetails}
          >
            تولید کد QR برای لینک محصول
          </button>
        </div>

        {/* Unique QR Code */}
        <div className="flex flex-col gap-4">
          <label className="block mb-2 text-gray-400">
            مدت زمان اعتبار (روز):
          </label>
          <select
            value={expiryDays || ""}
            onChange={(e) =>
              setExpiryDays(
                e.target.value === "" ? null : parseInt(e.target.value)
              )
            }
            className="px-4 py-2 bg-gray-700 rounded"
          >
            <option value="1">۱ روز</option>
            <option value="2">۲ روز</option>
            <option value="3">۳ روز</option>
            <option value="5">۵ روز</option>
            <option value="7">۷ روز</option>
            <option value="10">۱۰ روز</option>
            <option value="">بدون محدودیت</option>
          </select>

          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-500"
            disabled={uniqueQrCodeDetails}
          >
            تولید کد QR با لینک یکتا
          </button>
        </div>

        {qrCodeUrl && (
          <div className="mt-6">
            <p className="text-gray-400 mb-2">کد QR شما:</p>
            <div className="p-4 bg-white rounded-md flex justify-center">
              <QRCodeCanvas value={qrCodeUrl} size={256} />
            </div>
            <p className="mt-4 text-gray-500 break-all">
              <strong>لینک:</strong> {qrCodeUrl}
            </p>
            <button
              onClick={downloadQrCode}
              className="mt-4 px-4 py-2 bg-indigo-600 rounded hover:bg-indigo-700"
            >
              دانلود تصویر کد QR
            </button>
          </div>
        )}

        {uniqueQrCodeDetails && (
          <div className="mt-6">
            <p className="text-gray-400 mb-2">کد QR یکتای شما:</p>
            <div className="p-4 bg-white rounded-md flex justify-center">
              <QRCodeCanvas value={uniqueQrCodeDetails.qrCodeUrl} size={256} />
            </div>
            <p className="mt-4 text-gray-500">
              <strong>لینک:</strong> {uniqueQrCodeDetails.qrCodeUrl}
            </p>
            <p className="mt-2 text-gray-500">
              <strong>مدت اعتبار باقی‌مانده:</strong>{" "}
              {isNaN(uniqueQrCodeDetails.expiryDate)
                ? "بدون تاریخ انقضا"
                : `${Math.ceil(
                    (uniqueQrCodeDetails.expiryDate.getTime() - Date.now()) /
                      (1000 * 3600 * 24)
                  )} روز`}
            </p>
            <div className="flex gap-5 w-full">
              <button
                onClick={downloadQrCode}
                className="w-full mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                دانلود تصویر کد QR
              </button>

              <button
                onClick={deleteUniqueQrCode}
                className="w-full mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                حذف کد QR یکتا
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-gray-700 text-gray-200 rounded-xl shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-center mb-4">
              هشدار: ایجاد لینک یکتا
            </h2>
            <p className="mb-6 text-center">
              اگر این کد QR را تولید کنید، صفحه محصول فقط از طریق این لینک قابل
              دسترسی خواهد بود. آیا مطمئن هستید؟
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={generateUniqueQrCode}
                className="px-4 py-2 bg-green-600 rounded hover:bg-green-700"
              >
                بله، تولید کن
              </button>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QrCodeModal;
