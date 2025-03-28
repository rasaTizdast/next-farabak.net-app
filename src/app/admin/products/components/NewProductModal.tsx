import React, { useEffect, useReducer, useState, useCallback } from "react";
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
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";

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
    }
    case "slug": {
      if (!value) return "شناسه محصول الزامی است";
      if (value.length > 200)
        return "شناسه محصول نمیتواند بیشتر از ۲۰۰ کارکتر باشد.";
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
      return value.length > 0 ? "" : "حداقل یک ویژگی الزامی است";
    case "SEO_Title": {
      if (!value || value.length < 0) return "تیتر سئو الزامی است";
      if (value.length > 60) return "تیتر سئو نباید بیشتر از ۶۰ کارکتر باشد.";
    }
    case "SEO_Description": {
      if (!value || value.length < 0) return "توضیحات سئو الزامی است";
      if (value.length > 4000)
        return "توضیحات سئو نباید بیشتر از ۴۰۰۰ کارکتر باشد.";
    }
    case "keywords": {
      if (!value || value.length < 0) return "کلمات کلیدی الزامی است";
      if (value.length > 1000)
        return "کلمات کلیدی نمی‌توانند بیشتر از ۱۰۰۰ کارکتر باشند.";
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
  const [showNewOverviewDetailsModal, setShowNewOverviewDetailsModal] =
    useState(false);

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

    // Perform final validation before submission
    const newErrors = validateAllFields(state);
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error("لطفاً تمام خطاها را برطرف کنید.");
      return;
    }

    // Prepare the form data
    const selectedDetailsIds = state.overviewDetails
      .filter((detail) => detail.selected)
      .map((detail) => detail.ProductOverviewDetailsId);

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

const NewOverviewDetailsModal = ({ onClose }: { onClose: () => void }) => {
  const [items, setItems] = useState<
    {
      title: string;
      description: string;
      image: File | null;
      preview: string;
    }[]
  >([{ title: "", description: "", image: null, preview: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to handle adding a new item
  const addItem = () => {
    setItems([
      ...items,
      { title: "", description: "", image: null, preview: "" },
    ]);
  };

  // Function to handle removing an item
  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };

  // Function to handle field changes
  const handleChange = (index: number, field: string, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  // Function to handle image selection
  const handleImageSelect = (index: number, file: File) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        image: file,
        preview: URL.createObjectURL(file),
      };
      return updatedItems;
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isValid = items.every(
      (item) =>
        item.title.trim() !== "" &&
        item.description.trim() !== "" &&
        item.image !== null
    );

    if (!isValid) {
      toast.error("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("در حال ایجاد توضیحات محصول...");

    try {
      // Convert images to base64
      const itemsWithBase64 = await Promise.all(
        items.map(async (item) => {
          // Skip items without an image (should not happen due to validation)
          if (!item.image) return null;

          return new Promise<{
            title: string;
            description: string;
            image: any;
          }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // We already checked that item.image is not null above
              const image = item.image!;

              // Extract base name without extension to prevent duplicate extensions
              const fileName = image.name.includes(".")
                ? image.name.substring(0, image.name.lastIndexOf("."))
                : image.name;

              resolve({
                title: item.title,
                description: item.description,
                image: {
                  base64: (reader.result as string).split(",")[1],
                  contentType: image.type || "image/jpeg",
                  fileName: fileName,
                },
              });
            };
            // We're sure item.image is not null here since we checked above
            reader.readAsDataURL(item.image!);
          });
        })
      );

      // Filter out any null items (shouldn't happen if validation is working)
      const validItems = itemsWithBase64.filter((item) => item !== null);

      // Send to API
      const response = await fetch("/api/productOverviewDetails/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ overviewDetails: validItems }),
      });

      if (!response.ok) {
        throw new Error("خطا در ایجاد توضیحات محصول");
      }

      toast.dismiss();
      toast.success("توضیحات محصول با موفقیت ایجاد شد!");

      // Force a refresh of the overview details list
      // This will trigger a re-fetch of all overview details
      document.dispatchEvent(new CustomEvent("refreshOverviewDetails"));

      onClose();
    } catch (error) {
      console.error("Error creating overview details:", error);
      toast.dismiss();
      toast.error("خطا در ایجاد توضیحات محصول. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
      <div className="bg-gray-800 text-white rounded-xl shadow-lg p-6 w-full max-w-6xl max-h-[90dvh] overflow-y-scroll relative animate-fade-in">
        <h1 className="text-center font-bold mb-6 text-2xl">
          توضیحات محصول جدید
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {items.map((item, index) => (
              <ItemForm
                key={index}
                item={item}
                index={index}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
                handleImageSelect={handleImageSelect}
                removeItem={removeItem}
                showRemoveButton={items.length > 1}
              />
            ))}
          </div>

          <div className="flex flex-col gap-4 mt-6">
            <button
              type="button"
              onClick={addItem}
              className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white"
              disabled={isSubmitting}
            >
              افزودن آیتم جدید
            </button>

            <div className="flex gap-4 justify-center">
              <button
                type="submit"
                className="py-2 px-6 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "در حال ارسال..." : "ایجاد"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-6 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
                disabled={isSubmitting}
              >
                انصراف
              </button>
            </div>
          </div>
        </form>

        <div
          className="absolute top-4 right-4 text-red-400 hover:text-red-500 transition-all cursor-pointer"
          onClick={onClose}
        >
          <IoIosClose size={50} />
        </div>
      </div>
    </div>
  );
};

// Create a separate component for each item form to safely use hooks
type ItemFormProps = {
  item: {
    title: string;
    description: string;
    image: File | null;
    preview: string;
  };
  index: number;
  isSubmitting: boolean;
  handleChange: (index: number, field: string, value: string) => void;
  handleImageSelect: (index: number, file: File) => void;
  removeItem: (index: number) => void;
  showRemoveButton: boolean;
};

const ItemForm = ({
  item,
  index,
  isSubmitting,
  handleChange,
  handleImageSelect,
  removeItem,
  showRemoveButton,
}: ItemFormProps) => {
  // We can safely use hooks here because this component is rendered directly in the list
  // Not conditionally or in a loop inside the component
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      handleImageSelect(index, acceptedFiles[0]);
    },
    [index, handleImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: { "image/*": [] },
      maxFiles: 1,
      multiple: false,
    });

  return (
    <div className="bg-gray-900 rounded-lg p-4 relative">
      {showRemoveButton && (
        <button
          type="button"
          onClick={() => removeItem(index)}
          className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 rounded-lg"
        >
          <IoIosClose size={25} />
        </button>
      )}

      <div className="mb-4">
        <label className="block mb-2">عنوان</label>
        <input
          type="text"
          value={item.title}
          onChange={(e) => handleChange(index, "title", e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
          placeholder="عنوان را وارد کنید"
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">توضیحات</label>
        <textarea
          value={item.description}
          onChange={(e) => handleChange(index, "description", e.target.value)}
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white min-h-[100px]"
          placeholder="توضیحات را وارد کنید"
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-4">
        <label className="block mb-2">تصویر</label>
        <div
          {...getRootProps()}
          className={`p-4 border-2 border-dashed rounded-md text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-400 bg-blue-900/20"
              : isDragReject
              ? "border-red-400 bg-red-900/20"
              : "border-gray-600 hover:border-blue-400 hover:bg-blue-900/10"
          } ${item.preview ? "border-green-500" : ""}`}
        >
          <input {...getInputProps()} disabled={isSubmitting} />

          {item.preview ? (
            <div className="space-y-2">
              <p className="text-green-400">تصویر انتخاب شد</p>
              <p className="text-gray-400 text-sm">
                برای تغییر تصویر، کلیک کنید یا تصویر جدیدی را به اینجا بکشید
              </p>
            </div>
          ) : isDragActive ? (
            <p>فایل را اینجا رها کنید ...</p>
          ) : isDragReject ? (
            <p className="text-red-400">فقط فایل تصویر مجاز است!</p>
          ) : (
            <div className="space-y-2">
              <FiUpload className="mx-auto text-blue-400 text-3xl mb-2" />
              <p>برای انتخاب تصویر کلیک کنید یا تصویر را به اینجا بکشید</p>
              <p className="text-gray-400 text-sm">
                فرمت‌های مجاز: JPG، PNG، WebP | (اندازه پیشنهادی 1920*1080)
              </p>
            </div>
          )}
        </div>

        {item.preview && (
          <div className="mt-4 relative w-full h-48 bg-gray-700 rounded-md overflow-hidden">
            <img
              src={item.preview}
              alt="پیش‌نمایش"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};
