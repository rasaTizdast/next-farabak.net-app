import React, { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import axios from "axios";
import Image from "next/image";

type OverviewDetail = {
  ProductOverviewDetailsId: number;
  Title: string;
  Img: string;
  Description: string;
  selected: boolean;
};

type Props = {
  dispatch: React.Dispatch<{ type: string; details: OverviewDetail[] }>;
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
};

// Utility function to truncate text
const truncateText = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

const OverviewDetails = ({ dispatch, setErrors }: Props) => {
  const [overviewDetails, setOverviewDetails] = useState<OverviewDetail[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<OverviewDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true); // Loading state
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false); // State to toggle between showing limited or all details

  // Fetch overview details from the API
  useEffect(() => {
    let isMounted = true; // Prevent state updates if the component unmounts
    if (loading) {
      // Only fetch data if not already loaded
      axios
        .get("/api/productOverviewDetails/getAll")
        .then((response) => {
          if (isMounted) {
            const data = response.data.map((detail: any) => ({
              ...detail,
              selected: false,
            }));
            setOverviewDetails(data);
            dispatch({ type: "SET_OVERVIEW_DETAILS", details: data });
          }
        })
        .catch((error) => {
          if (isMounted) {
            setErrors({ apiError: "خطا در بارگذاری اطلاعات" });
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false);
          }
        });
    }
    return () => {
      isMounted = false; // Cleanup flag
    };
  }, [dispatch, setErrors]);

  // Toggle selection
  const toggleSelection = (id: number) => {
    const updatedDetails = overviewDetails.map((detail) =>
      detail.ProductOverviewDetailsId === id
        ? { ...detail, selected: !detail.selected }
        : detail
    );
    setOverviewDetails(updatedDetails);
    dispatch({ type: "SET_OVERVIEW_DETAILS", details: updatedDetails });
  };

  // Open the detail modal
  const openDetailModal = (detail: OverviewDetail) => {
    setSelectedDetail(detail);
  };

  // Close the detail modal
  const closeDetailModal = () => {
    setSelectedDetail(null);
  };

  // Determine which items to show based on `showAll` state
  const displayedDetails = showAll
    ? overviewDetails
    : overviewDetails.slice(0, 6);

  return (
    <div className="relative mb-6 p-4">
      {/* Skeleton Loader */}
      {loading ? (
        <div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="mb-4 flex items-center justify-between gap-4 p-4 border rounded-lg bg-gray-800 border-gray-700 animate-pulse"
            >
              <div className="h-8 w-full bg-gray-600 rounded"></div>
              <div className="flex gap-3">
                <div className="h-8 w-24 bg-gray-600 rounded"></div>
                <div className="h-8 w-24 bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Overview Details List */}
          <div className="relative">
            <div
              className={`grid grid-cols-1 gap-4 ${
                !showAll ? "max-h-[400px] overflow-hidden" : ""
              }`}
            >
              {displayedDetails.map((detail) => (
                <div
                  key={detail.ProductOverviewDetailsId}
                  className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-gray-800 border-gray-700"
                >
                  {/* Truncated Title */}
                  <span>{truncateText(detail.Title, 60)}</span>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => openDetailModal(detail)}
                      className="py-1 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
                    >
                      مشاهده
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        toggleSelection(detail.ProductOverviewDetailsId)
                      }
                      className={`py-1 px-3 rounded-md ${
                        detail.selected
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gray-500 hover:bg-gray-600"
                      }`}
                    >
                      {detail.selected ? "انتخاب شده" : "انتخاب"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Gradient Fade Effect */}
            {!showAll && (
              <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
            )}
          </div>

          {/* Show More / Show Less Button */}
          {overviewDetails.length > 6 && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="py-2 px-6 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md"
              >
                {showAll ? "نمایش کمتر" : "نمایش همه"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-full max-w-lg relative max-h-[700px] overflow-y-scroll">
            <button
              onClick={closeDetailModal}
              className="absolute top-3 right-3 text-red-400 hover:text-red-500"
            >
              <IoIosClose size={35} />
            </button>
            {/* Full Title */}
            <h2 className="text-xl text-center font-bold mt-7 mb-4">
              {selectedDetail.Title}
            </h2>
            <p className="text-gray-400 mb-4">{selectedDetail.Description}</p>

            {/* Image with Loading State */}
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
                onLoadingComplete={() => setImageLoaded(true)} // Update loading state when the image is loaded
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

export default OverviewDetails;
