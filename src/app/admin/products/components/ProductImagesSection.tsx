import React from "react";

import { Product } from "../types";
import ImageInput from "./ImageInput";

type ProductImagesSectionProps = {
  formState: Product;
  setNewImg1: React.Dispatch<React.SetStateAction<File | null>>;
  setNewImg2: React.Dispatch<React.SetStateAction<File | null>>;
};

const ProductImagesSection: React.FC<ProductImagesSectionProps> = ({
  formState,
  setNewImg1,
  setNewImg2,
}) => {
  return (
    <>
      <ImageInput
        label="تصویر بدون پس‌زمینه"
        imageUrl={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/productImages/${formState.img1}`}
        onChange={setNewImg1}
      />

      <ImageInput
        label="تصویر بنر"
        imageUrl={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/productImages/${formState.img2}`}
        onChange={setNewImg2}
      />
    </>
  );
};

export default ProductImagesSection;
