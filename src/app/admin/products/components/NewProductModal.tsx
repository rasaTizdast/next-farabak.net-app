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
import ProductBlog from "./newProductModalComponents/ProductBlog";
import NewOverviewDetailsModal from "./NewOverviewDetailsModal";

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
  productBlog: string;
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
  productBlog: "",
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
    case "SET_PRODUCT_BLOG":
      return { ...state, productBlog: action.productBlog };
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
  | "productBlog"
  | "specs"
  | "faq";

const validateField = (field: keyof State, value: any): string => {
  switch (field) {
    case "name": {
      if (!value) return "نام الزامی است";
      if (value.length > 100)
        return "نام محصول نمیتواند بیشتر از ۱۰۰ کارکتر باشد.";
      return "";
    }
    case "slug": {
      if (!value) return "شناسه محصول الزامی است";
      if (value.length > 200)
        return "شناسه محصول نمیتواند بیشتر از ۲۰۰ کارکتر باشد.";
      return "";
    }
    case "categoryID":
      return value !== null ? "" : "دسته‌بندی الزامی است";
    case "subCategoryID":
      return value !== null ? "" : "زیر دسته‌بندی الزامی است";
    case "smallDesc":
      return value ? "" : "توضیح کوتاه الزامی است";
    case "bannerImage":
      return value ? "" : "تصویر بنر الزامی است";
    case "transparentImage":
      return value ? "" : "تصویر بدون پسزمینه الزامی است";
    case "features":
      // Let the ProductOverview component handle detailed feature validation
      // Just check if there are any features at all
      return value.length > 0 ? "" : "حداقل یک ویژگی الزامی است";
    case "SEO_Title": {
      if (!value || value.length < 0) return "تیتر سئو الزامی است";
      if (value.length > 60) return "تیتر سئو نباید بیشتر از ۶۰ کارکتر باشد.";
      return "";
    }
    case "SEO_Description": {
      if (!value || value.length < 0) return "توضیحات سئو الزامی است";
      if (value.length > 4000)
        return "توضیحات سئو نباید بیشتر از ۴۰۰۰ کارکتر باشد.";
      return "";
    }
    case "keywords": {
      if (!value || value.length < 0) return "کلمات کلیدی الزامی است";
      if (value.length > 1000)
        return "کلمات کلیدی نمی‌توانند بیشتر از ۱۰۰۰ کارکتر باشند.";
      return "";
    }
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
  const [state, dispatch] = useReducer(productReducer, initialState);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [showNewOverviewDetailsModal, setShowNewOverviewDetailsModal] =
    useState(false);

  // Custom dispatch function to validate on state update
  const validatedDispatch = (action: any) => {
    dispatch(action);

    // If it's a field update, mark it as touched
    if (action.type === "SET_FIELD") {
      setTouchedFields((prev) => ({
        ...prev,
        [action.field]: true,
      }));

      // Dynamically validate the updated field
      const fieldError = validateField(action.field, action.value);
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        if (fieldError) {
          updatedErrors[action.field] = fieldError;
        } else {
          delete updatedErrors[action.field];
        }
        return updatedErrors;
      });
    }
  };

  // Check if there are any validation errors - improved version
  const hasErrors = () => {
    // Check if there are any errors in the errors object
    if (!errors) return false;

    // For debugging
    const errorEntries = Object.entries(errors).filter(
      ([_, errorMessage]) =>
        typeof errorMessage === "string" && errorMessage.trim() !== ""
    );

    if (errorEntries.length > 0) {
      console.log("Current validation errors:", errorEntries);
    }

    // Check if any error exists (any non-empty string value)
    return errorEntries.length > 0;
  };

  // Effect to validate fields and update errors
  useEffect(() => {
    const newErrors = validateAllFields(state);

    // Use setTimeout to give inputs a chance to update their local errors
    setTimeout(() => {
      setErrors((currentErrors) => {
        // Preserve validation errors from child components
        const preservedErrors = Object.keys(currentErrors)
          .filter(
            (key) =>
              key.startsWith("specs-") ||
              key.startsWith("faq-") ||
              key.startsWith("features-") ||
              key === "features" ||
              key.includes("-question-") ||
              key.includes("-answer-")
          )
          .reduce((obj, key) => {
            obj[key] = currentErrors[key];
            return obj;
          }, {} as { [key: string]: string });

        // Don't show validation errors for untouched fields unless form was submitted
        const filteredBaseErrors = Object.entries(newErrors)
          .filter(([key]) => hasSubmitted || touchedFields[key])
          .reduce((obj, [key, value]) => {
            obj[key] = value;
            return obj;
          }, {} as { [key: string]: string });

        // Combine preserved errors with filtered base errors
        return { ...preservedErrors, ...filteredBaseErrors };
      });
    }, 100);
  }, [state, touchedFields, hasSubmitted]);

  // Manage the collapse state for each section
  const [openSections, setOpenSections] = useState({
    baseDetails: true, // Start with baseDetails open
    productOverview: false,
    overviewDetails: false,
    productBlog: false,
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

    // Force all validations to run again
    const newBaseErrors = validateAllFields(state);

    // Update the errors state with all errors
    setErrors((prevErrors) => ({ ...prevErrors, ...newBaseErrors }));

    // Check if there are any errors
    if (hasErrors()) {
      console.log("Preventing submission due to validation errors");
      toast.error("لطفاً تمام خطاها را برطرف کنید.");
      return;
    }

    // If we reach here, there are no errors - safe to submit
    console.log("No validation errors found, proceeding with submission");
    submitForm();
  };

  // Extracted the form submission logic to a separate function
  const submitForm = async () => {
    // Check if no overviewDetails are selected
    const selectedDetailsIds = state.overviewDetails
      .filter((detail) => detail.selected)
      .map((detail) => detail.ProductOverviewDetailsId);

    // Prepare the form data
    const formData = {
      ...state,
      overviewDetails: selectedDetailsIds,
    };

    // Log the data being sent for debugging
    console.log("Sending product data:", formData);

    if (formData.price < formData.discount) {
      toast.error("تخفیف نمیتواند بیشتر از قیمت باشد.");
      return;
    }

    try {
      setModalVisible(true);
      await createProduct(formData, setProgress, setCurrentStep);
      setTimeout(() => {
        setModalVisible(false);
        setShowNewProductModal(false);
        refetchProducts();
        toast.success("محصول با موفقیت ایجاد شد!");
      }, 1000);
    } catch (error: any) {
      console.error("Error creating product:", error);
      setModalVisible(false);
      toast.error(
        "محصولی مشابه این محصول وجود دارد یا خطایی به وجود آمده لطفاً دوباره تلاش کنید"
      );
    }
  };

  // Helper to determine if we should show an error for a field
  const shouldShowError = (field: string): boolean => {
    return (hasSubmitted || touchedFields[field]) && !!errors[field];
  };

  return (
    <>
      {isModalVisible && (
        <ProgressModal progress={progress} currentStep={currentStep} />
      )}
      {showNewOverviewDetailsModal && (
        <NewOverviewDetailsModal
          onClose={() => setShowNewOverviewDetailsModal(false)}
        />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
        <div className="bg-gray-800 text-white rounded-xl shadow-lg p-6 w-full max-w-6xl max-h-[90dvh] overflow-y-scroll relative animate-fade-in">
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
                <span className="text-lg font-semibold">توضیحات محصول</span>
                {openSections.overviewDetails ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </div>
              {openSections.overviewDetails && (
                <>
                  <div
                    onClick={() => setShowNewOverviewDetailsModal(true)}
                    className="flex items-center justify-center gap-4 p-4 mt-4 mx-4 border rounded-lg bg-blue-600 hover:bg-blue-700 cursor-pointer border-blue-700 transition-all"
                  >
                    ساخت توضیحات محصول جدید
                  </div>
                  <OverviewDetails
                    dispatch={validatedDispatch}
                    setErrors={setErrors}
                  />
                </>
              )}
            </div>

            <div className="mb-4 bg-gray-900 rounded-md overflow-hidden">
              <div
                onClick={() => toggleSection("productBlog")}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-950 transition-all"
              >
                <span className="text-lg font-semibold">
                  توضیحات تکمیلی (مقاله محصول)
                </span>
                {openSections.productBlog ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </div>
              {openSections.productBlog && (
                <ProductBlog dispatch={validatedDispatch} slug={state.slug} />
              )}
            </div>

            {/* Specs Section */}
            <div className="mb-4 bg-gray-900 rounded-md overflow-hidden">
              <div
                onClick={() => toggleSection("specs")}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-950 transition-all"
              >
                <span className="text-lg font-semibold">مشخصات محصول</span>
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
                  hasSubmitted={hasSubmitted} // Pass hasSubmitted to Specs
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
                  hasSubmitted={hasSubmitted}
                />
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col items-center mt-6">
              {hasSubmitted && hasErrors() && (
                <div className="flex flex-wrap justify-center gap-2 my-4">
                  {Object.entries(errors).map(([key, error], index) => {
                    if (!error) return null;

                    // Format the error message for better readability
                    let errorMessage = error;
                    let fieldName = "";

                    // Extract field name for specs errors
                    if (key.startsWith("specs-")) {
                      const parts = key.split("-");
                      if (parts.length >= 3) {
                        const fieldType = parts[1]; // 'title' or 'description'
                        const itemIndex = parseInt(parts[2]) + 1;
                        fieldName = `مشخصات ${itemIndex} (${
                          fieldType === "title" ? "عنوان" : "توضیحات"
                        })`;
                      }
                    }
                    // Extract field name for feature errors
                    else if (key.startsWith("features-")) {
                      const parts = key.split("-");
                      if (parts.length >= 3) {
                        const itemIndex = parseInt(parts[2]) + 1;
                        fieldName = `ویژگی ${itemIndex}`;
                      }
                    }
                    // General features error
                    else if (key === "features") {
                      fieldName = "ویژگی‌ها";
                    }
                    // Extract field name for FAQ errors
                    else if (key.startsWith("faq-")) {
                      const parts = key.split("-");
                      if (parts.length >= 3) {
                        const fieldType = parts[1]; // 'question' or 'answer'
                        const itemIndex = parseInt(parts[2]) + 1;
                        fieldName = `سوال ${itemIndex} (${
                          fieldType === "question" ? "سوال" : "پاسخ"
                        })`;
                      }
                    }
                    // Legacy format for FAQ errors (for compatibility)
                    else if (
                      key.includes("-question-") ||
                      key.includes("-answer-")
                    ) {
                      const isQuestion = key.includes("-question-");
                      const itemIndex =
                        parseInt(key.split("-").pop() || "0") + 1;
                      fieldName = `سوال ${itemIndex} (${
                        isQuestion ? "سوال" : "پاسخ"
                      })`;
                    }
                    // Basic field names
                    else if (key === "name") fieldName = "نام محصول";
                    else if (key === "slug") fieldName = "شناسه محصول";
                    else if (key === "categoryID") fieldName = "دسته‌بندی";
                    else if (key === "subCategoryID")
                      fieldName = "زیر دسته‌بندی";
                    else if (key === "smallDesc") fieldName = "توضیح کوتاه";
                    else if (key === "bannerImage") fieldName = "تصویر بنر";
                    else if (key === "transparentImage")
                      fieldName = "تصویر بدون پسزمینه";
                    else if (key === "SEO_Title") fieldName = "تیتر سئو";
                    else if (key === "SEO_Description")
                      fieldName = "توضیحات سئو";
                    else if (key === "keywords") fieldName = "کلمات کلیدی";
                    else if (key === "features") fieldName = "ویژگی‌ها";

                    return (
                      <div
                        key={index}
                        className="bg-red-500 rounded-lg text-center p-2"
                      >
                        {fieldName && (
                          <span className="font-bold">{fieldName}: </span>
                        )}
                        {errorMessage}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Update the submit button to disable if there are errors */}
              <button
                type="submit"
                className={`py-2 px-6 rounded-lg ${
                  hasErrors()
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                disabled={hasErrors()}
                onClick={(e) => {
                  // This is a double-check to prevent submission if there are errors
                  if (hasErrors()) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Check specifically for feature errors to provide a targeted message
                    const hasFeatureErrors = Object.keys(errors).some(
                      (key) =>
                        (key === "features" || key.startsWith("features-")) &&
                        errors[key]
                    );

                    if (hasFeatureErrors) {
                      console.log(
                        "Submit prevented due to feature validation errors"
                      );
                      toast.error("لطفاً خطاهای ویژگی‌ها را برطرف کنید.");
                    } else {
                      console.log("Submit prevented due to validation errors");
                      toast.error("لطفاً تمام خطاها را برطرف کنید.");
                    }
                  }
                }}
              >
                ایجاد محصول
              </button>

              {/* Show error indicator when form has errors */}
              {hasSubmitted && hasErrors() && (
                <div className="mt-4 p-2 bg-red-500 text-white rounded-md text-sm text-center">
                  فرم دارای خطا است. لطفا تمامی موارد خطا را اصلاح کنید.
                </div>
              )}
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
