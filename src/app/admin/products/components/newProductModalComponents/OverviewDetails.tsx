import Image from "next/image";
import React, { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";

import { useApiFetch } from "@/hooks/useApiFetch";

import DeleteOverviewDetailButton from "../DeleteOverviewDetailButton";

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
  const [selectedDetail, setSelectedDetail] = useState<OverviewDetail | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const {
    data: detailsData,
    loading,
    refetch: fetchOverviewDetails,
  } = useApiFetch<any>("/api/productOverviewDetails/getAll");
  const [showAll, setShowAll] = useState(false); // State to toggle between showing limited or all details

  useEffect(() => {
    if (detailsData) {
      const data = (Array.isArray(detailsData) ? detailsData : []).map((detail: any) => ({
        ...detail,
        selected: false,
      }));
      setOverviewDetails(data);
      dispatch({ type: "SET_OVERVIEW_DETAILS", details: data });
    }
  }, [detailsData]);

  // Listen for the refresh event
  useEffect(() => {
    const handleRefresh = () => {
      fetchOverviewDetails();
    };

    // Add event listener
    document.addEventListener("refreshOverviewDetails", handleRefresh);

    // Cleanup
    return () => {
      document.removeEventListener("refreshOverviewDetails", handleRefresh);
    };
  }, []);

  // Toggle selection
  const toggleSelection = (id: number) => {
    const updatedDetails = overviewDetails.map((detail) =>
      detail.ProductOverviewDetailsId === id ? { ...detail, selected: !detail.selected } : detail
    );
    setOverviewDetails(updatedDetails);
    dispatch({ type: "SET_OVERVIEW_DETAILS", details: updatedDetails });
  };

  // Open the detail modal
  const openDetailModal = (detail: OverviewDetail) => {
    setSelectedDetail(detail);
    setImageLoaded(false);
  };

  // Close the detail modal
  const closeDetailModal = () => {
    setSelectedDetail(null);
  };

  // Determine which items to show based on `showAll` state
  const displayedDetails = showAll ? overviewDetails : overviewDetails.slice(0, 6);

  return (
    <div className="relative mb-6 p-4">
      {/* Skeleton Loader */}
      {loading ? (
        <div>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="mb-4 flex animate-pulse items-center justify-between gap-4 rounded-lg border border-gray-700 bg-gray-800 p-4"
            >
              <div className="h-8 w-full rounded bg-gray-600"></div>
              <div className="flex gap-3">
                <div className="h-8 w-24 rounded bg-gray-600"></div>
                <div className="h-8 w-24 rounded bg-gray-600"></div>
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
                  className="flex items-center justify-between gap-4 rounded-lg border border-gray-700 bg-gray-800 p-4"
                >
                  {/* Truncated Title */}
                  <span>{truncateText(detail.Title, 60)}</span>
                  <div className="flex gap-3">
                    <DeleteOverviewDetailButton
                      detailId={detail.ProductOverviewDetailsId}
                      detailTitle={detail.Title}
                      onSuccess={fetchOverviewDetails}
                    />
                    <button
                      type="button"
                      onClick={() => openDetailModal(detail)}
                      className="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                    >
                      مشاهده
                    </button>
                    <button
                      type="button"
                      data-testid={`overview-detail-select-${detail.ProductOverviewDetailsId}`}
                      onClick={() => toggleSelection(detail.ProductOverviewDetailsId)}
                      className={`rounded-md px-3 py-1 ${
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
              <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-gray-900 to-transparent"></div>
            )}
          </div>

          {/* Show More / Show Less Button */}
          {overviewDetails.length > 6 && (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className="rounded-lg bg-blue-500 px-6 py-2 text-white shadow-md hover:bg-blue-600"
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
          <div className="relative max-h-[700px] w-full max-w-lg overflow-y-scroll rounded-lg bg-gray-800 p-6 text-white shadow-lg">
            <button
              type="button"
              onClick={closeDetailModal}
              className="absolute right-3 top-3 text-red-400 hover:text-red-500"
            >
              <IoIosClose size={35} />
            </button>
            {/* Full Title */}
            <h2 className="mb-4 mt-7 text-center text-xl font-bold">{selectedDetail.Title}</h2>
            <p className="mb-4 text-gray-400">{selectedDetail.Description}</p>

            {/* Image with Loading State */}
            <div className="relative h-64 w-full overflow-hidden rounded-md bg-gray-700">
              <div
                className={`absolute inset-0 flex items-center justify-center ${
                  !imageLoaded ? "opacity-100" : "opacity-0"
                } transition-opacity duration-300`}
              >
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              </div>
              <Image
                height={1920}
                width={1080}
                quality={100}
                src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/overview-details-images${selectedDetail.Img}`}
                alt={selectedDetail.Title}
                className={`h-full w-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)} // Update loading state when the image is loaded
              />
            </div>

            <div className="mt-6 flex gap-2">
              <DeleteOverviewDetailButton
                detailId={selectedDetail.ProductOverviewDetailsId}
                detailTitle={selectedDetail.Title}
                onSuccess={() => {
                  closeDetailModal();
                  fetchOverviewDetails();
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

export default OverviewDetails;
