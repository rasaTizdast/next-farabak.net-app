import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

import { Overview, OverviewDetail, Product, Specs } from "../types";
import NewOverviewDetailsModal from "./NewOverviewDetailsModal";
import ProductBasicsSection from "./ProductBasicsSection";
import ProductCategorySection, { Category } from "./ProductCategorySection";
import ProductFormActions from "./ProductFormActions";
import { Loading } from "./ProductFormFields";
import ProductImagesSection from "./ProductImagesSection";
import {
  doUploadImage,
  handleProductImageUpdate,
  type UploadMutateFn,
  type S3DeleteBody,
} from "./ProductImageUpload";
import { createInputChangeHandler } from "./ProductInputChange";
import ProductKeywordsSection from "./ProductKeywordsSection";
import ProductOverviewSection from "./ProductOverviewSection";
import ProductPricingSection from "./ProductPricingSection";
import ProductSeoSection from "./ProductSeoSection";
import ProductSpecsSection from "./ProductSpecsSection";
import { deriveFaqErrors, FAQItem, validateProductForm } from "./ProductValidation";

type ProductFormProps = {
  product: Product | null;
  onClose: () => void;
  refetchProducts: () => void;
  setIsEditModalOpen: (arg0: boolean) => void;
};

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onClose,
  refetchProducts,
  setIsEditModalOpen,
}) => {
  const [formState, setFormState] = useState<Product | null>(() => product);
  const [newImg1, setNewImg1] = useState<File | null>(null);
  const [newImg2, setNewImg2] = useState<File | null>(null);
  const [isLoading, setIsloading] = useState<boolean>(false);
  const [showNewOverviewDetailsModal, setShowNewOverviewDetailsModal] = useState(false);

  const [overviews, setOverviews] = useState<Overview | null>(null);
  const [overviewDetails, setOverviewDetails] = useState<OverviewDetail[] | null>(null);
  const [specs, setSpecs] = useState<Specs | null>(null);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  const { data: categoriesData, error: categoriesError } =
    useApiFetch<Category[]>("/api/categories/getAll");
  const patchProduct = useApiMutation("patch");
  const postMutation = useApiMutation<Record<string, unknown>, unknown>("post");
  const putMutation = useApiMutation("put");
  const deleteMutation = useApiMutation<S3DeleteBody, unknown>("delete");

  const categories = categoriesData || [];
  useEffect(() => {
    if (categoriesError) {
      toast.error("در دریافت دسته بندی ها مشکلی به وجود آمده است، دوباره تلاش کنید");
    }
  }, [categoriesError]);

  const faqErrors = deriveFaqErrors(faqs);

  const validateFaqs = () => {
    return Object.keys(faqErrors).length === 0;
  };

  const imageUploader = async (
    image: File | null,
    productName: string,
    imageType: "banner" | "mini"
  ) => {
    return doUploadImage(image, productName, imageType, postMutation.mutate as UploadMutateFn);
  };

  const handleInputChange = createInputChangeHandler(setFormState);

  const handleBlogSave = (blog: string) => {
    setFormState((prevState) => (prevState ? { ...prevState, productBlog: blog } : null));
  };

  const hasFaqErrors = () => {
    return Object.keys(faqErrors).length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState) return;

    const formError = validateProductForm(formState);
    if (formError) {
      toast.error(formError);
      return;
    }

    if (!validateFaqs()) {
      toast.error("لطفاً تمام سوالات و پاسخ‌ها را تکمیل کنید و طول مجاز را رعایت نمایید.");
      return;
    }

    const formattedCategoryContentId = formState.CategoryContentIds.map(
      (subcategory) => subcategory.CategoryContentId
    ).join(",");

    const updatedFormState = {
      ...formState,
      CategoryContentId: formattedCategoryContentId,
    };

    setIsloading(true);
    try {
      const mainRes = await patchProduct.mutate(
        `/api/admin/products/${+updatedFormState.ProductId}`,
        {
          Name: updatedFormState.Name || "",
          Type: updatedFormState.Type || "",
          Price: updatedFormState.Price?.toString() || "0",
          Discount: updatedFormState.Discount?.toString() || "0",
          CategoryContentId: updatedFormState.CategoryContentId || "",
          Available: updatedFormState.Available ?? false,
          Description: updatedFormState.Description || "",
          CategoryId: updatedFormState.CategoryId || 0,
          img1: updatedFormState.img1,
          img2: updatedFormState.img2,
          Slug: updatedFormState.productSlug || "",
          SEO_Title: updatedFormState.SEO_Title || "",
          SEO_Description: updatedFormState.SEO_Description || "",
          productBlog: updatedFormState.productBlog || "",
        }
      );

      if (!mainRes) {
        toast.error("آپدیت ثبت محصول مورد نظر با شکست مواجه شد، مجدد تلاش کنید");
        setIsEditModalOpen(false);
        return;
      }

      const { img1, img2 } = await handleProductImageUpdate(
        formState.ProductId,
        formState.productSlug,
        newImg1,
        newImg2,
        deleteMutation.mutate,
        imageUploader
      );

      if (img1 || img2) {
        const imgRes = await patchProduct.mutate(
          `/api/admin/products/${updatedFormState.ProductId}/updateImages`,
          {
            img1,
            img2,
          }
        );
        if (!imgRes) {
          toast.error("آپدیت ثبت محصول مورد نظر با شکست مواجه شد، مجدد تلاش کنید");
          setIsEditModalOpen(false);
          return;
        }
      }

      if (overviews?.isChanged) {
        const overviewRes = await postMutation.mutate("/api/productOverview", {
          ProductId: formState.ProductId,
          ProductName: formState.Name,
          Features: [
            overviews.Property1,
            overviews.Property2,
            overviews.Property3,
            overviews.Property4,
          ],
        });
        if (!overviewRes) {
          toast.error("آپدیت ثبت محصول مورد نظر با شکست مواجه شد، مجدد تلاش کنید");
          setIsEditModalOpen(false);
          return;
        }
      }

      if (specs?.data) {
        const specsRes = await postMutation.mutate("/api/specs/update", {
          productId: formState.ProductId,
          specs: specs.data,
        });
        if (!specsRes) {
          toast.error("اپدیت بررسی ها به مشکل  برخورد، مجددا تلاش کنید");
        }
      }

      const detailsRes = await putMutation.mutate("/api/productOverviewDetails/update", {
        productId: updatedFormState.ProductId,
        ProductName: updatedFormState.Type,
        selectedDetails: overviewDetails,
      });
      if (!detailsRes) {
        toast.error("آپدیت جزئیات بررسی به مشکل خورده است.");
      }

      const faqsRes = await putMutation.mutate(`/api/faqs/product/${formState.ProductId}`, faqs);
      if (!faqsRes) {
        toast.error("ذخیره سوالات متداول با مشکل روبرو شد.");
      }

      toast.success("محصول مورد نظر با موفقیت آپدیت شد!");
      refetchProducts();
      setIsEditModalOpen(false);
    } finally {
      setIsloading(false);
    }
  };

  if (!formState) return null;

  const selectedCategory = categories.find((category) => category.Name === formState.categoryName);

  return (
    <>
      {showNewOverviewDetailsModal && (
        <NewOverviewDetailsModal onClose={() => setShowNewOverviewDetailsModal(false)} />
      )}
      <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black shadow-lg backdrop-blur-sm">
        <div className="max-h-[95dvh] w-full max-w-6xl overflow-auto rounded-lg bg-gray-800 p-6 text-white shadow-lg">
          <h2 className="mb-10 text-center text-xl font-bold">ویرایش محصول</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ProductBasicsSection formState={formState} onChange={handleInputChange} />
            <ProductCategorySection
              formState={formState}
              categories={categories}
              selectedCategory={selectedCategory}
              setFormState={setFormState}
            />
            <ProductImagesSection
              formState={formState}
              setNewImg1={setNewImg1}
              setNewImg2={setNewImg2}
            />
            <ProductOverviewSection
              formState={formState}
              overviews={overviews}
              setOverviews={setOverviews}
              setOverviewDetails={setOverviewDetails}
              setShowNewOverviewDetailsModal={setShowNewOverviewDetailsModal}
              onBlogSave={handleBlogSave}
            />
            <ProductPricingSection
              formState={formState}
              setFormState={setFormState}
              onChange={handleInputChange}
            />
            <ProductKeywordsSection formState={formState} onChange={handleInputChange} />
            <ProductSeoSection formState={formState} onChange={handleInputChange} />
            <ProductSpecsSection
              formState={formState}
              specs={specs}
              setSpecs={setSpecs}
              setFaqs={setFaqs}
              faqErrors={faqErrors}
            />
            <ProductFormActions onClose={onClose} hasFaqErrors={hasFaqErrors} />
          </form>
        </div>
      </div>
      {isLoading && <Loading />}
    </>
  );
};

export default ProductForm;
