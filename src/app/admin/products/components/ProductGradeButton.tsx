import React, { useState } from "react";
import { FaLayerGroup } from "react-icons/fa";

import { Product } from "../types";
import ProductGradeModal from "./ProductGradeModal";

type Props = {
  product: Product;
  refetchProducts: () => void;
};

const ProductGradeButton = ({ product, refetchProducts }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-lg bg-indigo-600 p-2 transition-all hover:bg-indigo-700"
        title="مدیریت گرید‌های محصول"
      >
        <FaLayerGroup size={20} color="#fff" />
      </button>

      {isModalOpen && (
        <ProductGradeModal
          product={product}
          onClose={() => setIsModalOpen(false)}
          refetchProducts={refetchProducts}
        />
      )}
    </>
  );
};

export default ProductGradeButton;
