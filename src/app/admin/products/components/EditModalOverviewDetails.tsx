import axios from "axios";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

import { OverviewDetail } from "../types";
import DeleteOverviewDetailButton from "./DeleteOverviewDetailButton";

type Props = {
  productId: number;
  setProductOverviewDetails: (arg0: OverviewDetail[]) => void;
  onLoadedChange: (loaded: boolean) => void;
};

const EditModalOverviewDetails = ({
  productId,
  setProductOverviewDetails,
  onLoadedChange,
}: Props) => {
  const [allOverviewDetails, setAllOverviewDetails] = useState<OverviewDetail[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<OverviewDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Number of items to show when collapsed
  const COLLAPSED_ITEM_COUNT = 3;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    onLoadedChange(false);

    try {
      const productDetailsRequest = axios
        .get<OverviewDetail[]>(`/api/productOverviewDetails/getProductOverviewDetails/${productId}`)
        .catch((error: unknown) => {
          // No associations are a valid empty state for a product.
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            return { data: [] as OverviewDetail[] };
          }
          throw error;
        });
      const [allDetailsRes, productDetailsRes] = await Promise.all([
        axios.get<OverviewDetail[]>("/api/productOverviewDetails/getAll"),
        productDetailsRequest,
      ]);
      const allDetails = allDetailsRes.data;
      const productDetails = productDetailsRes.data;

      if (!Array.isArray(allDetails) || !Array.isArray(productDetails)) {
        throw new Error("Invalid overview details response");
      }

      const updatedDetails = allDetails.map((detail) => ({
        ...detail,
        selected: productDetails.some(
          (productDetail) =>
            productDetail.ProductOverviewDetailsId === detail.ProductOverviewDetailsId
        ),
      }));

      setAllOverviewDetails(updatedDetails);
      setProductOverviewDetails(productDetails);
      onLoadedChange(true);
    } catch (error) {
      console.error(error);
      setLoadError(true);
      onLoadedChange(false);
      toast.error("در دریافت اطلاعات بررسی محصول مشکلی وجود دارد");
    } finally {
      setIsLoading(false);
    }
  }, [onLoadedChange, productId, setProductOverviewDetails]);

  useEffect(() => {
    void fetchData();
    document.addEventListener("refreshOverviewDetails", fetchData);

    return () => {
      document.removeEventListener("refreshOverviewDetails", fetchData);
    };
  }, [fetchData]);

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

  // Create a filtered list based on expansion state
  const displayedDetails = isExpanded
    ? allOverviewDetails
    : allOverviewDetails.slice(0, COLLAPSED_ITEM_COUNT);

  const hasMoreItems = allOverviewDetails.length > COLLAPSED_ITEM_COUNT;

  return (
    <div className="col-span-1 mt-3 flex flex-col gap-5 border-t-4 border-t-gray-200 pt-5 sm:col-span-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">توضیحات محصول</h3>
        {hasMoreItems && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-blue-400 transition-colors hover:text-blue-500"
          >
            {isExpanded ? (
              <>
                <span>نمایش کمتر</span>
                <FiChevronUp className="ml-1" />
              </>
            ) : (
              <>
                <span>نمایش {allOverviewDetails.length - COLLAPSED_ITEM_COUNT} مورد بیشتر</span>
                <FiChevronDown className="ml-1" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Overview Details List */}
      {isLoading ? (
        <div className="rounded-lg bg-gray-900 p-5 text-center text-sm text-gray-300" role="status">
          در حال بارگذاری توضیحات محصول...
        </div>
      ) : loadError ? (
        <div
          className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-gray-900 p-5 text-sm text-red-300"
          role="alert"
        >
          <span>دریافت توضیحات محصول ناموفق بود.</span>
          <button
            type="button"
            onClick={() => void fetchData()}
            className="underline underline-offset-2"
          >
            تلاش دوباره
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {displayedDetails.map((detail) => (
            <div
              key={detail.ProductOverviewDetailsId}
              className="flex flex-col gap-2 rounded-lg bg-gray-900 p-4 shadow-md"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{detail.Title}</h4>
                <div className="flex gap-2">
                  <DeleteOverviewDetailButton
                    detailId={detail.ProductOverviewDetailsId}
                    detailTitle={detail.Title}
                    onSuccess={fetchData}
                  />
                  <button
                    type="button"
                    onClick={() => toggleSelection(detail.ProductOverviewDetailsId)}
                    className={`rounded-md px-3 py-1 ${
                      detail.selected ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {detail.selected ? "انتخاب شده" : "انتخاب"}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => openDetailModal(detail)}
                className="mt-2 text-end text-sm hover:underline"
              >
                مشاهده جزئیات
              </button>
            </div>
          ))}
          {displayedDetails.length === 0 && (
            <p className="rounded-lg bg-gray-900 p-4 text-center text-sm text-gray-400">
              توضیحی برای این محصول ثبت نشده است.
            </p>
          )}
        </div>
      )}

      {/* Show more/less button at the bottom for better UX */}
      {!isLoading && !loadError && hasMoreItems && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 rounded-lg bg-gray-900 py-2 text-center text-blue-400 transition-colors hover:text-blue-500"
        >
          {isExpanded ? (
            <div className="flex items-center justify-center">
              <span>نمایش کمتر</span>
              <FiChevronUp className="ml-1" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span>نمایش {allOverviewDetails.length - COLLAPSED_ITEM_COUNT} مورد بیشتر</span>
              <FiChevronDown className="ml-1" />
            </div>
          )}
        </button>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
          <div className="relative max-h-[700px] w-full max-w-lg overflow-y-scroll rounded-lg bg-gray-800 p-6 text-white shadow-lg">
            <button
              type="button"
              aria-label="بستن"
              onClick={closeDetailModal}
              className="absolute top-3 right-3 text-red-400 hover:text-red-500"
            >
              <IoIosClose size={35} />
            </button>
            <h2 className="mt-7 mb-4 text-center text-xl font-bold">{selectedDetail.Title}</h2>
            <p className="mb-4 text-gray-400">{selectedDetail.Description}</p>

            <div className="relative h-64 w-full overflow-hidden rounded-md bg-gray-700">
              <div
                className={`absolute inset-0 flex items-center justify-center ${
                  !imageLoaded ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300`}
              >
                <div className="size-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
              <Image
                height={1920}
                width={1080}
                quality={100}
                src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/overview-details-images${selectedDetail.Img}`}
                alt={selectedDetail.Title}
                className={`size-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
              />
            </div>

            <div className="mt-6 flex gap-2">
              <DeleteOverviewDetailButton
                detailId={selectedDetail.ProductOverviewDetailsId}
                detailTitle={selectedDetail.Title}
                onSuccess={() => {
                  closeDetailModal();
                  fetchData();
                }}
              />
              <button
                type="button"
                onClick={() => {
                  toggleSelection(selectedDetail.ProductOverviewDetailsId);
                  closeDetailModal();
                }}
                className="flex-1 rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
              >
                {selectedDetail.selected ? "لغو انتخاب" : "انتخاب"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditModalOverviewDetails;
