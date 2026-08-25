"use client";

import Image from "next/image";
import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

import NewOverviewDetailsModal from "../../NewOverviewDetailsModal";
import { useNewProductOverviewDetails } from "../hooks/useNewProductOverviewDetails";
import { useNewProductWizard } from "../NewProductWizardContext";

const truncateText = (text: string, maxLength: number): string =>
  text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

export function OverviewDetailsStep() {
  const {
    overviewDetails,
    selectedDetail,
    imageLoaded,
    setImageLoaded,
    loading,
    showAll,
    setShowAll,
    displayedDetails,
    toggleSelection,
    openDetailModal,
    closeDetailModal,
  } = useNewProductOverviewDetails();
  const { openSections, actions, showOverviewDetailsModal } = useNewProductWizard();

  return (
    <>
      <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
        <button
          type="button"
          onClick={() => actions.toggleSection("overviewDetails")}
          className="flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-950"
        >
          <span className="text-lg font-semibold">توضیحات محصول</span>
          {openSections.overviewDetails ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </button>
        <div className={openSections.overviewDetails ? "block" : "hidden"}>
          <div className="relative mb-6 p-4">
            <button
              type="button"
              onClick={() => actions.setShowOverviewDetailsModal(true)}
              className="mx-4 mt-4 flex w-[calc(100%-2rem)] cursor-pointer items-center justify-center gap-4 rounded-lg border border-blue-700 bg-blue-600 p-4 transition-colors hover:bg-blue-700"
            >
              ساخت توضیحات محصول جدید
            </button>

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
                        <span>{truncateText(detail.Title, 60)}</span>
                        <div className="flex gap-3">
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

                  {!showAll && overviewDetails.length > 6 && (
                    <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-gray-900 to-transparent"></div>
                  )}
                </div>

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

            {selectedDetail && (
              <div className="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm">
                <div className="relative max-h-[700px] w-full max-w-lg overflow-y-scroll rounded-lg bg-gray-800 p-6 text-white shadow-lg">
                  <button
                    type="button"
                    aria-label="بستن"
                    onClick={closeDetailModal}
                    className="absolute top-3 right-3 text-red-400 hover:text-red-500"
                  >
                    <IoIosClose size={35} />
                  </button>
                  <h2 className="mt-7 mb-4 text-center text-xl font-bold">
                    {selectedDetail.Title}
                  </h2>
                  <p className="mb-4 text-gray-400">{selectedDetail.Description}</p>
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
                      onLoad={() => setImageLoaded(true)}
                    />
                  </div>
                  <div className="mt-6 flex gap-2">
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
        </div>
      </div>

      {showOverviewDetailsModal && (
        <NewOverviewDetailsModal onClose={() => actions.setShowOverviewDetailsModal(false)} />
      )}
    </>
  );
}
