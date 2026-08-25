"use client";

import { useCallback, useEffect, useState } from "react";

import { useApiFetch } from "@/hooks/useApiFetch";

import { useNewProductWizard } from "../NewProductWizardContext";

type OverviewDetail = {
  ProductOverviewDetailsId: number;
  Title: string;
  Img: string;
  Description: string;
  selected: boolean;
};

export function useNewProductOverviewDetails() {
  const { actions } = useNewProductWizard();

  const [overviewDetails, setOverviewDetails] = useState<
    {
      ProductOverviewDetailsId: number;
      Title: string;
      Img: string;
      Description: string;
      selected: boolean;
    }[]
  >([]);
  const [selectedDetail, setSelectedDetail] = useState<{
    ProductOverviewDetailsId: number;
    Title: string;
    Img: string;
    Description: string;
    selected: boolean;
  } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const {
    data: detailsData,
    loading,
    refetch: fetchOverviewDetails,
  } = useApiFetch<OverviewDetail[]>("/api/productOverviewDetails/getAll");

  useEffect(() => {
    if (detailsData) {
      const data = (Array.isArray(detailsData) ? detailsData : []).map(
        (detail: OverviewDetail) => ({
          ...detail,
          selected: false,
        })
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialize local editable overview details state from fetched data.
      setOverviewDetails(data);
      actions.setOverviewDetails(data);
    }
  }, [detailsData, actions]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchOverviewDetails();
    };
    document.addEventListener("refreshOverviewDetails", handleRefresh);
    return () => {
      document.removeEventListener("refreshOverviewDetails", handleRefresh);
    };
  }, [fetchOverviewDetails]);

  const toggleSelection = useCallback(
    (id: number) => {
      const updatedDetails = overviewDetails.map((detail) =>
        detail.ProductOverviewDetailsId === id ? { ...detail, selected: !detail.selected } : detail
      );
      setOverviewDetails(updatedDetails);
      actions.setOverviewDetails(updatedDetails);
    },
    [overviewDetails, actions]
  );

  const openDetailModal = useCallback((detail: (typeof overviewDetails)[0]) => {
    setSelectedDetail(detail);
    setImageLoaded(false);
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedDetail(null);
  }, []);

  const displayedDetails = showAll ? overviewDetails : overviewDetails.slice(0, 6);

  return {
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
    fetchOverviewDetails,
  };
}
