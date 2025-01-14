import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-hot-toast";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Import icons
import BaseDetails from "./newProductModalComponents/BaseDetails";
import ProductOverview from "./newProductModalComponents/ProductOverview";
import OverviewDetails from "./newProductModalComponents/OverviewDetails";
import Specs from "./newProductModalComponents/Specs";
import FAQ from "./newProductModalComponents/FAQ";
import { IoIosClose } from "react-icons/io";
import { createProduct } from "../utils/createProduct";
import ProgressModal from "./newProductModalComponents/ProgressModal";

// Types
type Category = {
  CategoryID: number;
  Name: string;
  Available: boolean;
  Subcategories: { CategoryContentId: number; Name: string }[];
};

type State = {
  name: string;
  slug: string;
  categoryID: number | null;
  subCategoryID: string | null;
  available: boolean;
  price: number;
  discount: number;
  smallDesc: string;
  bannerImage: File | null;
  transparentImage: File | null;
  SEO_Title: string;
  SEO_Description: string;
  keywords: string;
  features: string[];
  overviewDetails: {
    ProductOverviewDetailsId: number;
    Title: string;
    Img: string;
    Description: string;
    selected: boolean; // For selection state
  }[];
  specs: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
};

// Initial State
const initialState: State = {
  name: "",
  slug: "",
  categoryID: null,
  subCategoryID: "",
  available: true,
  price: 0,
  discount: 0,
  smallDesc: "",
  bannerImage: null,
  transparentImage: null,
  SEO_Title: "",
  SEO_Description: "",
  keywords: "",
  features: [],
  overviewDetails: [], // Initially empty, no predefined items
  specs: [],
  faqs: [],
};

// Reducer function
const productReducer = (state: State, action: any): State => {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_FEATURES":
      return { ...state, features: action.features };
    case "SET_OVERVIEW_DETAILS":
      return { ...state, overviewDetails: action.details };
    case "SET_SPECS":
      return { ...state, specs: action.specs };
    case "SET_FAQS":
      return { ...state, faqs: action.faqs };
    default:
      return state;
  }
};

type Props = {
  setShowNewProductModal: (visible: boolean) => void;
  refetchProducts: () => void;
  categories: Category[];
};

// Define the type for sections
type Section =
  | "baseDetails"
  | "productOverview"
  | "overviewDetails"
  | "specs"
  | "faq";

const validateField = (field: keyof State, value: any): string => {
  switch (field) {
    case "name":
      return value ? "" : "نام الزامی است";
    case "slug":
      return value ? "" : "شناسه محصول الزامی است";
    case "categoryID":
      return value !== null ? "" : "دسته‌بندی الزامی است";
    case "subCategoryID":
      return value !== null ? "" : "زیر دسته‌بندی الزامی است";
    case "smallDesc":
      return value ? "" : "توضیح کوتاه الزامی است";
    case "bannerImage":
      return value ? "" : "تصویر بنر الزامی است";
    case "transparentImage":
      return value ? "" : "تصویر شفاف الزامی است";
    case "features":
      return value.length > 0 ? "" : "حداقل یک ویژگی الزامی است";
    case "SEO_Title":
      return value.length > 0 ? "" : "تیتر سئو الزامی است";
    case "SEO_Description":
      return value.length > 0 ? "" : "توضیحات سئو الزامی است";
    case "keywords":
      return value.length > 0 ? "" : "کلمات کلیدی الزامی است";
    default:
      return ""; // No validation needed
  }
};

const validateAllFields = (state: State): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};
  Object.entries(state).forEach(([field, value]) => {
    const error = validateField(field as keyof State, value);
    if (error) errors[field] = error;
  });
  return errors;
};

const NewProductModal = ({
  setShowNewProductModal,
  categories,
  refetchProducts,
}: Props) => {
  // Add a new state to track if the user has tried to submit
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [state, dispatch] = useReducer(productReducer, initialState);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [isModalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Custom dispatch function to validate on state update
  const validatedDispatch = (action: any) => {
    dispatch(action);

    // Dynamically validate the updated field
    if (action.type === "SET_FIELD") {
      const fieldError = validateField(action.field, action.value);
      setErrors((prev) => {
        const updatedErrors = { ...prev, [action.field]: fieldError };
        return updatedErrors;
      });
    }
  };

  // Effect to clear error messages after correction
  useEffect(() => {
    const newErrors = validateAllFields(state);
    setErrors(newErrors);
  }, [state]);

  // Manage the collapse state for each section
  const [openSections, setOpenSections] = useState({
    baseDetails: false,
    productOverview: false,
    overviewDetails: false,
    specs: false,
    faq: false,
  });

  // Handle the toggling of each section
  const toggleSection = (section: Section) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    // Perform final validation before submission
    const newErrors = validateAllFields(state);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("لطفاً تمام خطاها را برطرف کنید.");
      return;
    } else {
      setModalVisible(true);
    }

    // Prepare the form data
    const selectedDetailsIds = state.overviewDetails
      .filter((detail) => detail.selected)
      .map((detail) => detail.ProductOverviewDetailsId);

    const formData = {
      ...state,
      overviewDetails: selectedDetailsIds,
    };

    try {
      await createProduct(formData, setProgress, setCurrentStep);
      setTimeout(() => {
        setModalVisible(false);
        setShowNewProductModal(false);
        refetchProducts();
        toast.success("محصول با موفقیت ایجاد شد!");
      }, 1000);
    } catch (error: any) {
      setModalVisible(false);
      toast.error(
        "محصولی مشابه این محصول وجود دارد یا خطایی به وجود آمده لطفاً دوباره تلاش کنید"
      );
    }
  };

  return (
    <>
      {isModalVisible && (
        <ProgressModal progress={progress} currentStep={currentStep} />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
        <div className="bg-gray-800 text-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90dvh] overflow-y-scroll relative animate-fade-in">
          <h1 className="text-center font-bold mb-10 text-2xl">محصول جدید</h1>

          <form onSubmit={handleSubmit}>
            {/* Base Details */}
            <div className="mb-4 bg-gray-900 rounded-md overflow-hidden">
              <div
                onClick={() => toggleSection("baseDetails")}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-950 transition-all"
              >
                <span className="text-lg font-semibold">جزئیات پایه</span>
                {openSections.baseDetails ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </div>
              {openSections.baseDetails && (
                <BaseDetails
                  state={state}
                  dispatch={validatedDispatch}
                  categories={categories}
                  setErrors={setErrors} // Pass setErrors to child components
                />
              )}
            </div>

            {/* Product Overview */}
            <div className="mb-4 bg-gray-900 rounded-md overflow-hidden">
              <div
                onClick={() => toggleSection("productOverview")}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-950 transition-all"
              >
                <span className="text-lg font-semibold">بررسی محصول</span>
                {openSections.productOverview ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </div>
              {openSections.productOverview && (
                <ProductOverview
                  state={state}
                  dispatch={validatedDispatch}
                  setErrors={setErrors}
                />
              )}
            </div>

            {/* Overview Details */}
            <div className="mb-4 bg-gray-900 rounded-md overflow-hidden">
              <div
                onClick={() => toggleSection("overviewDetails")}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-950 transition-all"
              >
                <span className="text-lg font-semibold">جزئیات بررسی</span>
                {openSections.overviewDetails ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </div>
              {openSections.overviewDetails && (
                <OverviewDetails
                  dispatch={validatedDispatch}
                  setErrors={setErrors}
                />
              )}
            </div>

            {/* Specs Section */}
            <div className="mb-4 bg-gray-900 rounded-md overflow-hidden">
              <div
                onClick={() => toggleSection("specs")}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-950 transition-all"
              >
                <span className="text-lg font-semibold">مشخصات</span>
                {openSections.specs ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </div>
              {openSections.specs && (
                <Specs
                  state={state}
                  dispatch={validatedDispatch}
                  setErrors={setErrors}
                />
              )}
            </div>

            {/* FAQ Section */}
            <div className="mb-4 bg-gray-900 rounded-md overflow-hidden">
              <div
                onClick={() => toggleSection("faq")}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-950 transition-all"
              >
                <span className="text-lg font-semibold">سوالات متداول</span>
                {openSections.faq ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </div>
              {openSections.faq && (
                <FAQ
                  state={state}
                  dispatch={validatedDispatch}
                  setErrors={setErrors}
                />
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-center mt-6">
              {hasSubmitted && (
                <div className="flex flex-wrap justify-center gap-2 my-4">
                  {Object.values(errors).map((error, index) =>
                    error ? (
                      <div
                        key={index}
                        className="bg-red-500 rounded-lg text-center p-2"
                      >
                        {error}
                      </div>
                    ) : null
                  )}
                </div>
              )}
              {/* Update the submit button to disable only if there are errors and submission hasn't been attempted */}
              <button
                type="submit"
                className={`py-2 px-6 rounded-lg ${
                  hasSubmitted && Object.keys(errors).length > 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                disabled={hasSubmitted && Object.keys(errors).length > 0}
              >
                ایجاد محصول
              </button>
            </div>
          </form>

          <div
            className="absolute top-4 right-4 text-red-400 hover:text-red-500 transition-all cursor-pointer"
            onClick={() => setShowNewProductModal(false)}
          >
            <IoIosClose size={50} />
          </div>
        </div>
      </div>
    </>
  );
};

export default NewProductModal;
