import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-hot-toast";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Import icons
import { IoIosClose } from "react-icons/io";

import NewOverviewDetailsModal from "./NewOverviewDetailsModal";
import BaseDetails from "./newProductModalComponents/BaseDetails";
import FAQ from "./newProductModalComponents/FAQ";
import OverviewDetails from "./newProductModalComponents/OverviewDetails";
import ProductBlog from "./newProductModalComponents/ProductBlog";
import ProductOverview from "./newProductModalComponents/ProductOverview";
import Specs from "./newProductModalComponents/Specs";
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
const productReducer = (
  state: State,
  action: {
    type: string;
    field: string;
    value: string;
    features: string[];
    details: {
      ProductOverviewDetailsId: number;
      Title: string;
      Img: string;
      Description: string;
      selected: boolean;
    }[];
    productBlog: string;
    specs: { title: string; description: string }[];
    faqs: { question: string; answer: string }[];
  }
): State => {
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

// Validation regexes and constraints from Prisma schema
type ValidationRule = {
  required: boolean;
  maxLength?: number;
  regex?: RegExp | null;
  errorMsg: {
    required: string;
    maxLength?: string;
    regex?: string;
  };
};

const validationRules: Record<string, ValidationRule> = {
  name: {
    required: true,
    maxLength: 1000, // Based on Prisma schema line 268
    regex: null,
    errorMsg: {
      required: "نام الزامی است",
      maxLength: "نام محصول نمیتواند بیشتر از ۱۰۰۰ کارکتر باشد.",
      regex: "",
    },
  },
  slug: {
    required: true,
    maxLength: 1200, // Based on Prisma schema line 277
    regex: /^[a-zA-Z0-9_-]+$/, // Allow only alphanumeric, hyphens, and underscores
    errorMsg: {
      required: "شناسه محصول الزامی است",
      maxLength: "شناسه محصول نمیتواند بیشتر از ۱۲۰۰ کارکتر باشد.",
      regex: "شناسه محصول فقط می‌تواند شامل حروف انگلیسی، اعداد، خط فاصله و زیرخط باشد.",
    },
  },
  smallDesc: {
    required: true,
    maxLength: 1000, // Based on Prisma schema line 275
    regex: null,
    errorMsg: {
      required: "توضیح کوتاه الزامی است",
      maxLength: "توضیح کوتاه نمیتواند بیشتر از ۱۰۰۰ کارکتر باشد.",
      regex: "",
    },
  },
  SEO_Title: {
    required: true,
    maxLength: 60, // Based on Prisma schema line 278
    regex: null,
    errorMsg: {
      required: "تیتر سئو الزامی است",
      maxLength: "تیتر سئو نباید بیشتر از ۶۰ کارکتر باشد.",
      regex: "",
    },
  },
  SEO_Description: {
    required: true,
    maxLength: 4000, // Based on Prisma schema line 279
    regex: null,
    errorMsg: {
      required: "توضیحات سئو الزامی است",
      maxLength: "توضیحات سئو نباید بیشتر از ۴۰۰۰ کارکتر باشد.",
      regex: "",
    },
  },
  keywords: {
    required: true,
    maxLength: 2000, // Using a reasonable limit based on SEO_Keywords in SEO_Category model
    regex: null,
    errorMsg: {
      required: "کلمات کلیدی الزامی است",
      maxLength: "کلمات کلیدی نمی‌توانند بیشتر از ۲۰۰۰ کارکتر باشند.",
      regex: "",
    },
  },
  price: {
    required: true,
    maxLength: 20, // Based on Prisma schema line 269
    regex: /^\d+(\.\d{1,2})?$/, // Allow numbers with up to 2 decimal places
    errorMsg: {
      required: "قیمت الزامی است",
      maxLength: "قیمت نمیتواند بیشتر از ۲۰ کارکتر باشد.",
      regex: "قیمت باید یک عدد معتبر باشد (حداکثر ۲ رقم اعشار).",
    },
  },
  discount: {
    required: false,
    maxLength: 20, // Based on Prisma schema line 270
    regex: /^\d+(\.\d{1,2})?$/, // Allow numbers with up to 2 decimal places
    errorMsg: {
      required: "",
      maxLength: "تخفیف نمیتواند بیشتر از ۲۰ کارکتر باشد.",
      regex: "تخفیف باید یک عدد معتبر باشد (حداکثر ۲ رقم اعشار).",
    },
  },
  categoryID: {
    required: true,
    errorMsg: {
      required: "دسته‌بندی الزامی است",
    },
  },
  subCategoryID: {
    required: true,
    errorMsg: {
      required: "زیر دسته‌بندی الزامی است",
    },
  },
  bannerImage: {
    required: true,
    errorMsg: {
      required: "تصویر بنر الزامی است",
    },
  },
  transparentImage: {
    required: true,
    errorMsg: {
      required: "تصویر بدون پسزمینه الزامی است",
    },
  },
  features: {
    required: true,
    errorMsg: {
      required: "حداقل یک ویژگی الزامی است",
    },
  },
  productBlog: {
    required: false,
    errorMsg: {
      required: "",
    },
  },
};

const validateField = (field: keyof State, value: any): string => {
  // Get validation rules for the field
  const rules = validationRules[field as keyof typeof validationRules];
  if (!rules) return ""; // No validation rules for this field

  // Check if field is required
  if (
    rules.required &&
    (!value ||
      (typeof value === "string" && !value.trim()) ||
      (Array.isArray(value) && value.length === 0))
  ) {
    return rules.errorMsg.required;
  }

  // For string values, check length and pattern
  if (typeof value === "string" && value) {
    // Check max length
    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.errorMsg.maxLength || "";
    }

    // Check regex pattern if defined
    if (rules.regex && !rules.regex.test(value)) {
      return rules.errorMsg.regex || "";
    }
  }

  // For numerical fields with string representation
  if ((field === "price" || field === "discount") && value !== 0 && !value) {
    return field === "price" ? rules.errorMsg.required : "";
  }

  // For price and discount, validate they're proper numbers
  if (
    (field === "price" || field === "discount") &&
    rules.regex &&
    (isNaN(parseFloat(value.toString())) || !rules.regex.test(value.toString()))
  ) {
    return rules.errorMsg.regex || "";
  }

  // For arrays
  if (Array.isArray(value)) {
    if (field === "features" && rules.required && value.length === 0) {
      return rules.errorMsg.required;
    }
  }

  return "";
};

const validateAllFields = (state: State): { [key: string]: string } => {
  const errors: { [key: string]: string } = {};

  // Validate each field in the state against the validation rules
  Object.entries(state).forEach(([field, value]) => {
    const error = validateField(field as keyof State, value);
    if (error) errors[field] = error;
  });

  // Special validation for price and discount
  if (parseFloat(state.price.toString()) < parseFloat(state.discount.toString())) {
    errors.discount = "تخفیف نمیتواند بیشتر از قیمت باشد.";
  }

  return errors;
};

// Fixed tab state persistence issues by rendering all section components
// and conditionally showing/hiding them based on the section's open state.
// This approach ensures that component state is preserved when sections are closed/reopened.
// We use CSS classes (block/hidden) for toggling visibility instead of conditional rendering.
const NewProductModal = ({ setShowNewProductModal, categories, refetchProducts }: Props) => {
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
  const [showNewOverviewDetailsModal, setShowNewOverviewDetailsModal] = useState(false);

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
      ([_, errorMessage]) => typeof errorMessage === "string" && errorMessage.trim() !== ""
    );

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
          .reduce(
            (obj, key) => {
              obj[key] = currentErrors[key];
              return obj;
            },
            {} as { [key: string]: string }
          );

        // Don't show validation errors for untouched fields unless form was submitted
        const filteredBaseErrors = Object.entries(newErrors)
          .filter(([key]) => hasSubmitted || touchedFields[key])
          .reduce(
            (obj, [key, value]) => {
              obj[key] = value;
              return obj;
            },
            {} as { [key: string]: string }
          );

        // Combine preserved errors with filtered base errors
        return { ...preservedErrors, ...filteredBaseErrors };
      });
    }, 100);
  }, [state, touchedFields, hasSubmitted]);

  // Manage the collapse state for each section
  const [openSections, setOpenSections] = useState({
    baseDetails: false, // Start with baseDetails open
    productOverview: false,
    overviewDetails: false,
    productBlog: false,
    specs: false,
    faq: false,
  });

  // Handle the toggling of each section
  const toggleSection = (section: Section) => {
    // If opening the productBlog section, give editor a chance to initialize first
    if (section === "productBlog" && !openSections.productBlog) {
      // Open the section
      setOpenSections((prevState) => ({
        ...prevState,
        [section]: true,
      }));

      // Allow the ProductBlog component to fully initialize
      return;
    }

    // Normal toggle behavior for other sections
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
      toast.error("لطفاً تمام خطاها را برطرف کنید.");

      // Automatically open the first section with errors
      const sectionsWithErrors = findSectionsWithErrors();
      if (sectionsWithErrors.length > 0) {
        setOpenSections((prevState) => ({
          ...prevState,
          [sectionsWithErrors[0]]: true,
        }));
      }

      return;
    }

    submitForm();
  };

  // Find sections that contain errors
  const findSectionsWithErrors = (): Section[] => {
    const sectionsWithErrors: Section[] = [];

    // Base details section
    const baseDetailFields = [
      "name",
      "slug",
      "categoryID",
      "subCategoryID",
      "price",
      "discount",
      "smallDesc",
      "bannerImage",
      "transparentImage",
      "SEO_Title",
      "SEO_Description",
      "keywords",
    ];

    if (baseDetailFields.some((field) => errors[field])) {
      sectionsWithErrors.push("baseDetails");
    }

    // Product overview section
    if (errors.features || Object.keys(errors).some((key) => key.startsWith("features-"))) {
      sectionsWithErrors.push("productOverview");
    }

    // Overview details section
    if (Object.keys(errors).some((key) => key.startsWith("overviewDetails-"))) {
      sectionsWithErrors.push("overviewDetails");
    }

    // Product blog section
    if (errors.productBlog) {
      sectionsWithErrors.push("productBlog");
    }

    // Specs section
    if (Object.keys(errors).some((key) => key.startsWith("specs-"))) {
      sectionsWithErrors.push("specs");
    }

    // FAQ section
    if (
      Object.keys(errors).some(
        (key) => key.startsWith("faq-") || key.includes("-question-") || key.includes("-answer-")
      )
    ) {
      sectionsWithErrors.push("faq");
    }

    return sectionsWithErrors;
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
    } catch (error) {
      console.error("مشکلی در ساخت محصول جدید", error);
      setModalVisible(false);
      toast.error("محصولی مشابه این محصول وجود دارد یا خطایی به وجود آمده لطفاً دوباره تلاش کنید");
    }
  };

  return (
    <>
      {isModalVisible && <ProgressModal progress={progress} currentStep={currentStep} />}
      {showNewOverviewDetailsModal && (
        <NewOverviewDetailsModal onClose={() => setShowNewOverviewDetailsModal(false)} />
      )}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
        <div className="relative max-h-[90dvh] w-full max-w-6xl animate-fade-in overflow-y-scroll rounded-xl bg-gray-800 p-6 text-white shadow-lg">
          <h1 className="mb-10 text-center text-2xl font-bold">محصول جدید</h1>

          <form onSubmit={handleSubmit}>
            {/* Base Details */}
            <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
              <div
                onClick={() => toggleSection("baseDetails")}
                className="flex cursor-pointer items-center justify-between p-4 transition-all hover:bg-gray-950"
              >
                <span className="text-lg font-semibold">جزئیات پایه</span>
                {openSections.baseDetails ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </div>
              <div className={openSections.baseDetails ? "block" : "hidden"}>
                <BaseDetails
                  state={state}
                  dispatch={validatedDispatch}
                  categories={categories}
                  setErrors={setErrors}
                />
              </div>
            </div>

            {/* Product Overview */}
            <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
              <div
                onClick={() => toggleSection("productOverview")}
                className="flex cursor-pointer items-center justify-between p-4 transition-all hover:bg-gray-950"
              >
                <span className="text-lg font-semibold">بررسی محصول</span>
                {openSections.productOverview ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </div>
              <div className={openSections.productOverview ? "block" : "hidden"}>
                <ProductOverview state={state} dispatch={validatedDispatch} setErrors={setErrors} />
              </div>
            </div>

            {/* Overview Details */}
            <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
              <div
                onClick={() => toggleSection("overviewDetails")}
                className="flex cursor-pointer items-center justify-between p-4 transition-all hover:bg-gray-950"
              >
                <span className="text-lg font-semibold">توضیحات محصول</span>
                {openSections.overviewDetails ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </div>
              <div className={openSections.overviewDetails ? "block" : "hidden"}>
                <div
                  onClick={() => setShowNewOverviewDetailsModal(true)}
                  className="mx-4 mt-4 flex cursor-pointer items-center justify-center gap-4 rounded-lg border border-blue-700 bg-blue-600 p-4 transition-all hover:bg-blue-700"
                >
                  ساخت توضیحات محصول جدید
                </div>
                <OverviewDetails dispatch={validatedDispatch} setErrors={setErrors} />
              </div>
            </div>

            <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
              <div
                onClick={() => toggleSection("productBlog")}
                className="flex cursor-pointer items-center justify-between p-4 transition-all hover:bg-gray-950"
              >
                <span className="text-lg font-semibold">توضیحات تکمیلی (مقاله محصول)</span>
                {openSections.productBlog ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </div>
              <div className={openSections.productBlog ? "block" : "hidden"}>
                <ProductBlog dispatch={validatedDispatch} slug={state.slug} />
              </div>
            </div>

            {/* Specs Section */}
            <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
              <div
                onClick={() => toggleSection("specs")}
                className="flex cursor-pointer items-center justify-between p-4 transition-all hover:bg-gray-950"
              >
                <span className="text-lg font-semibold">مشخصات محصول</span>
                {openSections.specs ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </div>
              <div className={openSections.specs ? "block" : "hidden"}>
                <Specs
                  state={state}
                  dispatch={validatedDispatch}
                  setErrors={setErrors}
                  hasSubmitted={hasSubmitted}
                />
              </div>
            </div>

            {/* FAQ Section */}
            <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
              <div
                onClick={() => toggleSection("faq")}
                className="flex cursor-pointer items-center justify-between p-4 transition-all hover:bg-gray-950"
              >
                <span className="text-lg font-semibold">سوالات متداول</span>
                {openSections.faq ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </div>
              <div className={openSections.faq ? "block" : "hidden"}>
                <FAQ
                  state={state}
                  dispatch={validatedDispatch}
                  setErrors={setErrors}
                  hasSubmitted={hasSubmitted}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex flex-col items-center">
              {hasSubmitted && hasErrors() && (
                <div className="my-4 flex flex-wrap justify-center gap-2">
                  {Object.entries(errors).map(([key, error], index) => {
                    if (!error) return null;

                    // Format the error message for better readability
                    const errorMessage = error;
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
                    else if (key.includes("-question-") || key.includes("-answer-")) {
                      const isQuestion = key.includes("-question-");
                      const itemIndex = parseInt(key.split("-").pop() || "0") + 1;
                      fieldName = `سوال ${itemIndex} (${isQuestion ? "سوال" : "پاسخ"})`;
                    }
                    // Basic field names
                    else if (key === "name") fieldName = "نام محصول";
                    else if (key === "slug") fieldName = "شناسه محصول";
                    else if (key === "categoryID") fieldName = "دسته‌بندی";
                    else if (key === "subCategoryID") fieldName = "زیر دسته‌بندی";
                    else if (key === "smallDesc") fieldName = "توضیح کوتاه";
                    else if (key === "bannerImage") fieldName = "تصویر بنر";
                    else if (key === "transparentImage") fieldName = "تصویر بدون پسزمینه";
                    else if (key === "SEO_Title") fieldName = "تیتر سئو";
                    else if (key === "SEO_Description") fieldName = "توضیحات سئو";
                    else if (key === "keywords") fieldName = "کلمات کلیدی";
                    else if (key === "features") fieldName = "ویژگی‌ها";

                    return (
                      <div key={index} className="rounded-lg bg-red-500 p-2 text-center">
                        {fieldName && <span className="font-bold">{fieldName}: </span>}
                        {errorMessage}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Update the submit button to disable if there are errors */}
              <button
                type="submit"
                className={`rounded-lg px-6 py-2 ${
                  hasErrors() ? "cursor-not-allowed bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                disabled={hasErrors()}
                onClick={(e) => {
                  // This is a double-check to prevent submission if there are errors
                  if (hasErrors()) {
                    e.preventDefault();
                    e.stopPropagation();

                    // Check specifically for feature errors to provide a targeted message
                    const hasFeatureErrors = Object.keys(errors).some(
                      (key) => (key === "features" || key.startsWith("features-")) && errors[key]
                    );

                    if (hasFeatureErrors) {
                      toast.error("لطفاً خطاهای ویژگی‌ها را برطرف کنید.");
                    } else {
                      toast.error("لطفاً تمام خطاها را برطرف کنید.");
                    }
                  }
                }}
              >
                ایجاد محصول
              </button>

              {/* Show error indicator when form has errors */}
              {hasSubmitted && hasErrors() && (
                <div className="mt-4 rounded-md bg-red-500 p-2 text-center text-sm text-white">
                  فرم دارای خطا است. لطفا تمامی موارد خطا را اصلاح کنید.
                </div>
              )}
            </div>
          </form>

          <div
            className="absolute right-4 top-4 cursor-pointer text-red-400 transition-all hover:text-red-500"
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
