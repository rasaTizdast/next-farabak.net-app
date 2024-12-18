import React, { useReducer, useState } from "react";
import { toast } from "react-hot-toast";
import { FiChevronDown, FiChevronUp } from "react-icons/fi"; // Import icons
import BaseDetails from "./newProductModalComponents/BaseDetails";
import ProductOverview from "./newProductModalComponents/ProductOverview";
import OverviewDetails from "./newProductModalComponents/OverviewDetails";
import Specs from "./newProductModalComponents/Specs";
import FAQ from "./newProductModalComponents/FAQ";
import { IoIosClose } from "react-icons/io";

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
  subCategoryID: number | null;
  available: boolean;
  price: number;
  smallDesc: string;
  bannerImage: string;
  transparentImage: string;
  features: string[];
  overviewDetails: { title: string; image: string; selected: boolean }[];
  specs: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
};

// Initial State
const initialState: State = {
  name: "",
  slug: "",
  categoryID: null,
  subCategoryID: null,
  available: true,
  price: 0,
  smallDesc: "",
  bannerImage: "",
  transparentImage: "",
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
  categories: Category[];
};

const NewProductModal = ({ setShowNewProductModal, categories }: Props) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Manage the collapse state for each section
  const [openSections, setOpenSections] = useState({
    baseDetails: false,
    productOverview: false,
    overviewDetails: false,
    specs: false,
    faq: false,
  });

  // Handle the toggling of each section
  const toggleSection = (section: string) => {
    setOpenSections((prevState) => ({
      ...prevState,
      [section]: !prevState[section],
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(state); // For now, log the form data
    toast.success("Product created successfully!");
  };

  return (
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
                dispatch={dispatch}
                categories={categories}
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
              <ProductOverview state={state} dispatch={dispatch} />
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
              <OverviewDetails state={state} dispatch={dispatch} />
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
            {openSections.specs && <Specs state={state} dispatch={dispatch} />}
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
            {openSections.faq && <FAQ state={state} dispatch={dispatch} />}
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-6 rounded-lg"
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
  );
};

export default NewProductModal;
