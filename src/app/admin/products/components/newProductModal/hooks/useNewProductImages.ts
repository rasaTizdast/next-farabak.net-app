"use client";

import { useCallback, useEffect, useState } from "react";

import { useNewProductWizard } from "../NewProductWizardContext";

export function useNewProductImages() {
  const { state, actions } = useNewProductWizard();

  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null);
  const [transparentImagePreview, setTransparentImagePreview] = useState<string | null>(null);

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      if (bannerImagePreview) URL.revokeObjectURL(bannerImagePreview);
      if (transparentImagePreview) URL.revokeObjectURL(transparentImagePreview);
    };
  }, [bannerImagePreview, transparentImagePreview]);

  const handleBannerImageChange = useCallback(
    (file: File | null) => {
      actions.setField("bannerImage", file);
      setBannerImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return file ? URL.createObjectURL(file) : null;
      });
    },
    [actions]
  );

  const handleTransparentImageChange = useCallback(
    (file: File | null) => {
      actions.setField("transparentImage", file);
      setTransparentImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return file ? URL.createObjectURL(file) : null;
      });
    },
    [actions]
  );

  const clearBannerImage = useCallback(() => {
    handleBannerImageChange(null);
  }, [handleBannerImageChange]);

  const clearTransparentImage = useCallback(() => {
    handleTransparentImageChange(null);
  }, [handleTransparentImageChange]);

  const hasBannerImage = !!state.bannerImage;
  const hasTransparentImage = !!state.transparentImage;

  return {
    bannerImage: state.bannerImage,
    transparentImage: state.transparentImage,
    hasBannerImage,
    hasTransparentImage,
    bannerImagePreview,
    transparentImagePreview,
    handleBannerImageChange,
    handleTransparentImageChange,
    clearBannerImage,
    clearTransparentImage,
  };
}
