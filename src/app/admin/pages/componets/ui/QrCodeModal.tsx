import { QRCodeCanvas } from "qrcode.react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { IoIosClose } from "react-icons/io";

type Props = {
  onClose: (arg0: boolean) => void;
  blog: {
    id: number;
    link: string;
    QrCode_key?: string;
    QrCode_expiryDays?: string;
  } | null;
  refetchBlogs: () => void;
};

const BlogQrCodeModal = ({ onClose, blog, refetchBlogs }: Props) => {
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
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
  };

  const calculateExpiryTimestamp = (days: number | null) => {
    if (!days) return null;
    const now = new Date();
    now.setDate(now.getDate() + days);
    return now.toISOString();
  };

  useEffect(() => {
    if (blog) {
      fetchUniqueQrCodeDetails();
    }
  }, [blog]);

  const fetchUniqueQrCodeDetails = async () => {
    if (!blog || !blog.QrCode_key || !blog.QrCode_expiryDays) {
      return;
    }

    const expiryDate = new Date(blog.QrCode_expiryDays);
    const currentDate = new Date();
    const isExpired = currentDate > expiryDate;

    if (isExpired) {
      await deleteUniqueQrCode();
    } else {
      setUniqueQrCodeDetails({
        qrCodeUrl: `${process.env.NEXT_PUBLIC_BASE_URL}${blog.link}?key=${blog.QrCode_key}`,
        expiryDate,
      });
    }
  };

  const deleteUniqueQrCode = async () => {
    if (!blog) return;

    try {
      const response = await fetch("/api/blogs/qrCode", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId: blog.id,
        }),
      });

      if (!response.ok) return;

      toast.success("کد QR یکتا با موفقیت حذف شد.");
      onClose(false);
      refetchBlogs();
    } catch (error) {
      console.error(error);
      toast.error("خطایی در ارتباط با سرور رخ داده است.");
    }
  };

  const generateUniqueQrCode = async () => {
    if (!blog) return;

    setShowConfirmModal(false);

    const uniqueKey = generateUniqueKey();
    const expiry = calculateExpiryTimestamp(expiryDays);

    try {
      const response = await fetch("/api/blogs/qrCode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          blogId: blog.id,
          qrCodeKey: uniqueKey,
          qrCodeExpiryDays: expiryDays === null ? "never" : expiry || "",
        }),
      });

      if (!response.ok) {
        toast.error("خطایی در ذخیره اطلاعات کد QR رخ داده است.");
        return;
      }
      toast.success("کد Qr یکتا با موفقیت ساخته شد.");
      onClose(false);
      refetchBlogs();
    } catch (error) {
      console.error(error);
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

  if (!blog) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
      dir="rtl"
    >
      <div className="relative max-h-[90dvh] w-full max-w-2xl animate-fade-in overflow-y-scroll rounded-xl bg-gray-800 p-6 text-white shadow-lg">
        <button type="button"
          onClick={() => {
            onClose(false);
            resetState();
          }}
          className="absolute right-4 top-4 text-red-400 transition-all hover:text-red-500"
          aria-label="بستن"
        >
          <IoIosClose size={50} />
        </button>
        <h1 className="mb-10 text-center text-xl font-bold">تولید کد QR</h1>

        {/* Normal QR Code */}
        <div className="mb-6">
          <button type="button"
            onClick={() => {
              setQrCodeUrl(`${process.env.NEXT_PUBLIC_BASE_URL}${blog.link}`);
            }}
            className="w-full rounded bg-blue-600 px-4 py-2 hover:bg-blue-700 disabled:bg-gray-500"
            disabled={uniqueQrCodeDetails}
          >
            تولید کد QR برای لینک بلاگ
          </button>
        </div>

        {/* Unique QR Code */}
        <div className="flex flex-col gap-4">
          <label className="mb-2 block text-gray-400">مدت زمان اعتبار (روز):</label>
          <select
            value={expiryDays || ""}
            onChange={(e) => setExpiryDays(e.target.value === "" ? null : parseInt(e.target.value))}
            className="rounded bg-gray-700 px-4 py-2"
          >
            <option value="1">۱ روز</option>
            <option value="2">۲ روز</option>
            <option value="3">۳ روز</option>
            <option value="5">۵ روز</option>
            <option value="7">۷ روز</option>
            <option value="10">۱۰ روز</option>
            <option value="">بدون محدودیت</option>
          </select>

          <button type="button"
            onClick={() => setShowConfirmModal(true)}
            className="rounded bg-green-600 px-4 py-2 hover:bg-green-700 disabled:bg-gray-500"
            disabled={uniqueQrCodeDetails}
          >
            تولید کد QR با لینک یکتا
          </button>
        </div>

        {qrCodeUrl && (
          <div className="mt-6">
            <p className="mb-2 text-gray-400">کد QR شما:</p>
            <div className="flex justify-center rounded-md bg-white p-4">
              <QRCodeCanvas value={qrCodeUrl} size={256} />
            </div>
            <p className="mt-4 break-all text-gray-500">
              <strong>لینک:</strong> {qrCodeUrl}
            </p>
            <button type="button"
              onClick={downloadQrCode}
              className="mt-4 rounded bg-indigo-600 px-4 py-2 hover:bg-indigo-700"
            >
              دانلود تصویر کد QR
            </button>
          </div>
        )}

        {uniqueQrCodeDetails && (
          <div className="mt-6">
            <p className="mb-2 text-gray-400">کد QR یکتای شما:</p>
            <div className="flex justify-center rounded-md bg-white p-4">
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
                    (uniqueQrCodeDetails.expiryDate.getTime() - Date.now()) / (1000 * 3600 * 24)
                  )} روز`}
            </p>
            <div className="flex w-full gap-5">
              <button type="button"
                onClick={downloadQrCode}
                className="mt-4 w-full rounded bg-blue-600 px-4 py-2 hover:bg-blue-700"
              >
                دانلود تصویر کد QR
              </button>

              <button type="button"
                onClick={deleteUniqueQrCode}
                className="mt-4 w-full rounded bg-red-600 px-4 py-2 hover:bg-red-700"
              >
                حذف کد QR یکتا
              </button>
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="z-60 fixed inset-0 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-gray-700 p-6 text-gray-200 shadow-lg md:max-w-lg">
            <h2 className="mb-4 text-center text-lg font-bold 2xl:mb-7 2xl:text-2xl">
              هشدار: ایجاد لینک یکتا
            </h2>
            <p className="mb-6 text-center 2xl:text-lg">
              اگر این کد QR را تولید کنید، صفحه این بلاگ فقط از طریق این لینک قابل دسترسی خواهد بود
              و اگر محدودیت زمانی به غیر از (هیچ‌وقت) انتخاب کنید، بعد از پایان زمان اعتبار، بلاگ به
              حالت قبلی خود برمی‌گردد{" "}
              {
                <span className="text-blue-400">
                  (بلاگی که در حالت انتشار نباشد با داشتن کد Qr می‌تواند برای بیننده قابل دیدن باشد)
                </span>
              }
              . آیا مطمئن هستید؟
            </p>
            <div className="flex justify-center gap-4">
              <button type="button"
                onClick={generateUniqueQrCode}
                className="rounded bg-green-600 px-4 py-2 hover:bg-green-700"
              >
                بله، تولید کن
              </button>
              <button type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded bg-red-600 px-4 py-2 hover:bg-red-700"
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

export default BlogQrCodeModal;
