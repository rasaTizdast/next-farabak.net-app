import React from "react";

import { Overview, OverviewDetail, Product } from "../types";
import EditModalOverview from "./EditModalOverview";
import EditModalOverviewDetails from "./EditModalOverviewDetails";
import EditModalProductBlog from "./EditModalProductBlog";

type ProductOverviewSectionProps = {
  formState: Product;
  overviews: Overview | null;
  setOverviews: React.Dispatch<React.SetStateAction<Overview | null>>;
  setOverviewDetails: React.Dispatch<React.SetStateAction<OverviewDetail[] | null>>;
  setShowNewOverviewDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
  onBlogSave: (blog: string) => void;
};

const ProductOverviewSection: React.FC<ProductOverviewSectionProps> = ({
  formState,
  overviews,
  setOverviews,
  setOverviewDetails,
  setShowNewOverviewDetailsModal,
  onBlogSave,
}) => {
  return (
    <>
      <EditModalOverview
        ProductId={formState.ProductId}
        overviews={overviews}
        SetOverviews={setOverviews}
      />
      <div className="col-span-1 sm:col-span-2">
        <EditModalProductBlog
          blog={formState.productBlog}
          onSave={onBlogSave}
          slug={formState.productSlug}
        />
      </div>

      <EditModalOverviewDetails
        productId={formState.ProductId}
        setProductOverviewDetails={setOverviewDetails}
      />
      <div className="col-span-1 border-b-4 border-b-gray-200 pb-2 sm:col-span-2">
        <button
          type="button"
          onClick={() => setShowNewOverviewDetailsModal(true)}
          className="mb-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          ایجاد توضیحات محصول جدید
        </button>
      </div>
    </>
  );
};

export default ProductOverviewSection;
