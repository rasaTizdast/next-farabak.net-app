import React, { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { Specs } from "../types";

type Props = {
  productId: number;
  productName: string;
  specs: Specs | null;
  setSpecs: (arg0: Specs) => void;
};

const EditModalSpecs = ({ productId, productName, specs, setSpecs }: Props) => {
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    axios
      .get(`/api/products/getProductSpecsByProductId?productId=${productId}`)
      .then((response) => {
        setSpecs(response.data || { data: [] }); // Handle null response
      })
      .catch(() => {
        toast.error("مشخصاتی برای این محصول پیدا نشد");
        setSpecs({ data: [] }); // Set empty specs if none exist
      })
      .finally(() => setLoading(false)); // Turn off loading
  }, [productId]);

  const validateField = (field: string, value: string) => {
    let error = "";
    if (field === "Title") {
      if (!value.trim()) error = "عنوان نمی‌تواند خالی باشد.";
      else if (value.length > 100)
        error = "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.";
      else if (!/^[a-zA-Z0-9\u0600-\u06FF\s_-]+$/.test(value))
        error = "عنوان فقط می‌تواند شامل حروف انگلیسی، فارسی و اعداد باشد.";
    } else if (field === "Description") {
      if (!value.trim()) error = "توضیحات نمی‌تواند خالی باشد.";
      else if (value.length > 1000)
        error = "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
    }
    return error;
  };

  const handleSpecChange = (
    index: number,
    field: keyof Specs["data"][0],
    value: string
  ) => {
    const error = validateField(field, value);
    setLocalErrors((prev) => ({ ...prev, [`${field}-${index}`]: error }));

    const updatedSpecs = [...(specs?.data || [])];
    updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
    setSpecs({ data: updatedSpecs });
  };

  const handleAddSpec = () => {
    const newSpec = {
      ProductSpecsId: Date.now(), // Temporary ID for new specs
      Name: productName,
      Title: "",
      Description: "",
      ProductId: productId,
      Available: true,
    };

    setSpecs({ data: [...(specs?.data || []), newSpec] });
  };

  const handleRemoveSpec = (index: number) => {
    const updatedSpecs = specs?.data.filter((_, i) => i !== index) || [];
    setSpecs({ data: updatedSpecs });
  };

  if (loading) {
    return <div>در حال بارگذاری...</div>; // Show a loading message
  }

  return (
    <div className="flex flex-col gap-5 col-span-1 sm:col-span-2 border-y-4 border-y-gray-200 my-5 py-5">
      <div className="mb-3">مشخصات</div>
      {specs?.data.map((spec, index) => (
        <div
          key={spec.ProductSpecsId}
          className="flex flex-col gap-5 bg-gray-900 p-4 rounded-md shadow-lg"
        >
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={spec.Title}
              onChange={(e) => handleSpecChange(index, "Title", e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-300"
              placeholder={`عنوان مشخصه ${index + 1}`}
            />
            {localErrors[`Title-${index}`] && (
              <p className="text-red-500 mt-1">
                {localErrors[`Title-${index}`]}
              </p>
            )}
            <button
              type="button"
              onClick={() => handleRemoveSpec(index)}
              className="text-red-500 hover:text-red-600 transition-all"
            >
              <FaTrashAlt size={20} />
            </button>
          </div>
          <textarea
            value={spec.Description}
            onChange={(e) =>
              handleSpecChange(index, "Description", e.target.value)
            }
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-300"
            placeholder={`توضیحات مشخصه ${index + 1}`}
          />
          {localErrors[`Description-${index}`] && (
            <p className="text-red-500 mt-1">
              {localErrors[`Description-${index}`]}
            </p>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddSpec}
        className="w-full bg-blue-600 text-white py-2 px-4 mt-3 rounded-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
      >
        افزودن مشخصه جدید
      </button>
    </div>
  );
};

export default EditModalSpecs;
