import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { IoIosClose } from "react-icons/io";
import toast from "react-hot-toast";
import { OverviewDetail } from "../types";

type Props = {
  productId: number;
  productOverviewDetails: OverviewDetail[] | null;
  setProductOverviewDetails: (arg0: OverviewDetail[]) => void;
};

const EditModalOverviewDetails = ({
  productId,
  productOverviewDetails,
  setProductOverviewDetails,
}: Props) => {
  const [allOverviewDetails, setAllOverviewDetails] = useState<OverviewDetail[]>(
    []
  );
  const [selectedDetail, setSelectedDetail] = useState<OverviewDetail | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Fetch all overview details
    const fetchAllDetails = axios.get("/api/productOverviewDetails/getAll");
    // Fetch product's selected overview details
    const fetchProductDetails = axios.get(
      `/api/productOverviewDetails/getProductOverviewDetails/${productId}`
    );

    Promise.all([fetchAllDetails, fetchProductDetails])
      .then(([allDetailsRes, productDetailsRes]) => {
        const productDetails = productDetailsRes.data;
        const allDetails = allDetailsRes.data;

        // Mark selected items
        const updatedDetails = allDetails.map((detail: OverviewDetail) => ({
          ...detail,
          selected: productDetails.some(
            (pd: OverviewDetail) =>
              pd.ProductOverviewDetailsId === detail.ProductOverviewDetailsId
          ),
        }));

        setAllOverviewDetails(updatedDetails);
        setProductOverviewDetails(productDetails); // Ensure parent state is updated
      })
      .catch(() =>
        toast.error("در دریافت اطلاعات مشکلی وجود دارد")
      );
  }, [productId, setProductOverviewDetails]);

  const toggleSelection = (detailId: number) => {
    const updatedDetails = allOverviewDetails.map((detail) =>
      detail.ProductOverviewDetailsId === detailId
        ? { ...detail, selected: !detail.selected }
        : detail
    );
    setAllOverviewDetails(updatedDetails);

    // Update parent component's state with only selected items
    const selectedDetails = updatedDetails.filter((detail) => detail.selected);
    setProductOverviewDetails(selectedDetails);
  };

  const openDetailModal = (detail: OverviewDetail) => {
    setSelectedDetail(detail);
    setImageLoaded(false);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDetail(null);
  };

  return (
    <div className="flex flex-col gap-5 col-span-1 sm:col-span-2 border-b-4 border-b-gray-200 mb-5 pb-5">
      <h3 className="text-lg font-semibold mb-4">ویژگی‌های محصول</h3>

      {/* Overview Details List */}
      <div className="grid grid-cols-1 gap-4">
        {allOverviewDetails.map((detail) => (
          <div
            key={detail.ProductOverviewDetailsId}
            className="bg-gray-900 p-4 rounded-lg shadow-md flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{detail.Title}</h4>
              <button
                type="button"
                onClick={() => toggleSelection(detail.ProductOverviewDetailsId)}
                className={`px-3 py-1 rounded-md ${
                  detail.selected
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {detail.selected ? "انتخاب شده" : "انتخاب"}
              </button>
            </div>
            <button
              type="button"
              onClick={() => openDetailModal(detail)}
              className="text-end text-sm mt-2 hover:underline"
            >
              مشاهده جزئیات
            </button>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-full max-w-lg relative max-h-[700px] overflow-y-scroll">
            <button
              onClick={closeDetailModal}
              className="absolute top-3 right-3 text-red-400 hover:text-red-500"
            >
              <IoIosClose size={35} />
            </button>
            <h2 className="text-xl text-center font-bold mt-7 mb-4">
              {selectedDetail.Title}
            </h2>
            <p className="text-gray-400 mb-4">{selectedDetail.Description}</p>

            <div className="relative w-full h-64 bg-gray-700 rounded-md overflow-hidden">
              <div
                className={`absolute inset-0 flex items-center justify-center ${
                  !imageLoaded ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300`}
              >
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <Image
                height={1920}
                width={1080}
                quality={100}
                src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/overview-details-images${selectedDetail.Img}`}
                alt={selectedDetail.Title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            <button
              onClick={() => {
                toggleSelection(selectedDetail.ProductOverviewDetailsId);
                closeDetailModal();
              }}
              className="mt-6 py-2 px-6 bg-blue-500 hover:bg-blue-600 rounded-lg text-white w-full"
            >
              {selectedDetail.selected ? "لغو انتخاب" : "انتخاب"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditModalOverviewDetails;
