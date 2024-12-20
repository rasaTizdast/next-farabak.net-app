import React, { useState, useEffect } from "react";
import { FaCheck, FaTrashAlt } from "react-icons/fa";

type OverviewDetail = {
  title: string;
  image: string;
  selected: boolean;
};

type Props = {
  state: { overviewDetails: OverviewDetail[] };
  dispatch: React.Dispatch<{ type: string; details: OverviewDetail[] }>;
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
};

const OverviewDetails = ({ state, dispatch, setErrors }: Props) => {
  const [localOverviewDetails, setLocalOverviewDetails] = useState<OverviewDetail[]>(
    state.overviewDetails
  );
  const [localErrors, setLocalErrors] = useState<{ [key: number]: { [field: string]: string } }>(
    {}
  );

  useEffect(() => {
    setLocalOverviewDetails(state.overviewDetails);
  }, [state.overviewDetails]);

  useEffect(() => {
    const errors = Object.values(localErrors).reduce((acc, curr) => {
      return { ...acc, ...curr };
    }, {});
    setErrors(errors);
  }, [localErrors, setErrors]);

  const validateTitle = (value: string) => {
    if (!value.trim()) return "عنوان نمی‌تواند خالی باشد.";
    if (value.length > 2000) return "عنوان نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد.";
    return "";
  };

  const validateImage = (value: string) => {
    if (!value.trim()) return "تصویر نمی‌تواند خالی باشد.";
    if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(value))
      return "تصویر باید یک URL معتبر باشد.";
    return "";
  };

  const handleValidation = (index: number, field: string, value: string) => {
    let error = "";
    if (field === "title") error = validateTitle(value);
    if (field === "image") error = validateImage(value);

    setLocalErrors((prev) => {
      const newErrors = { ...prev };
      if (!newErrors[index]) newErrors[index] = {};
      newErrors[index][field] = error;
      return newErrors;
    });
  };

  const handleOverviewChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedDetails = [...localOverviewDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setLocalOverviewDetails(updatedDetails);
    dispatch({ type: "SET_OVERVIEW_DETAILS", details: updatedDetails });
    handleValidation(index, field, value);
  };

  const toggleSelection = (index: number) => {
    const updatedDetails = [...localOverviewDetails];
    updatedDetails[index].selected = !updatedDetails[index].selected;
    setLocalOverviewDetails(updatedDetails);
    dispatch({ type: "SET_OVERVIEW_DETAILS", details: updatedDetails });
  };

  const handleAddOverviewDetail = () => {
    if (localOverviewDetails.length < 12) {
      setLocalOverviewDetails([
        ...localOverviewDetails,
        { title: "", image: "", selected: false },
      ]);
    }
  };

  const handleRemoveOverviewDetail = (index: number) => {
    const updatedDetails = localOverviewDetails.filter((_, i) => i !== index);
    setLocalOverviewDetails(updatedDetails);
    dispatch({ type: "SET_OVERVIEW_DETAILS", details: updatedDetails });
  };

  return (
    <div className="mb-6 p-4">
      {localOverviewDetails.map((detail, index) => (
        <div
          key={index}
          className={`${
            localOverviewDetails.length ? "mb-10 flex flex-col gap-5" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={detail.title}
              onChange={(e) =>
                handleOverviewChange(index, "title", e.target.value)
              }
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-300"
              placeholder={`عنوان بررسی ${index + 1}`}
            />
            {localErrors[index]?.title && (
              <p className="text-red-500 mt-1">{localErrors[index].title}</p>
            )}
            <input
              type="text"
              value={detail.image}
              onChange={(e) =>
                handleOverviewChange(index, "image", e.target.value)
              }
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-300"
              placeholder="تصویر"
            />
            {localErrors[index]?.image && (
              <p className="text-red-500 mt-1">{localErrors[index].image}</p>
            )}
            <button
              type="button"
              onClick={() => toggleSelection(index)}
              className={`rounded-md text-white ${
                detail.selected ? "text-green-600" : "text-gray-600"
              } hover:opacity-80`}
            >
              <FaCheck size={22} />
            </button>
            <button
              type="button"
              onClick={() => handleRemoveOverviewDetail(index)}
              className="text-red-500 hover:text-red-600 transition-all"
            >
              <FaTrashAlt size={20} />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddOverviewDetail}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
        disabled={localOverviewDetails.length >= 12}
      >
        افزودن جزئیات جدید
      </button>
    </div>
  );
};

export default OverviewDetails;
