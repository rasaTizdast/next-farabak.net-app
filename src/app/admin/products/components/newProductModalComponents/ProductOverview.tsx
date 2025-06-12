import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";

type State = {
  features: string[];
};

type Props = {
  state: State;
  dispatch: React.Dispatch<any>;
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
};

const ProductOverview = ({ state, dispatch, setErrors }: Props) => {
  const [localFeatures, setLocalFeatures] = useState<string[]>(state.features);
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setErrors((prev) => ({ ...prev, ...localErrors }));
  }, [localErrors, setErrors]);

  const validateField = (value: string) => {
    let error = "";
    if (!value.trim()) error = "ویژگی نمی‌تواند خالی باشد.";
    else if (value.length > 300)
      error = "ویژگی نمی‌تواند بیشتر از ۳۰۰ کاراکتر باشد.";
    else if (
      !/^[\u0600-\u06FFa-zA-Z0-9\s.,;:'"()<>[\]{}\\/@#$%^&*+=\-_!?]+$/.test(
        value
      )
    )
      error =
        "ویژگی فقط می‌تواند شامل حروف فارسی، انگلیسی، اعداد و علائم نگارشی باشد.";
    return error;
  };

  const handleFeatureChange = (index: number, value: string) => {
    const error = validateField(value);
    setLocalErrors((prev) => ({ ...prev, [`feature-${index}`]: error }));

    const updatedFeatures = [...localFeatures];
    updatedFeatures[index] = value;
    setLocalFeatures(updatedFeatures);
    dispatch({ type: "SET_FEATURES", features: updatedFeatures });
  };

  const handleFeatureAdd = () => {
    if (localFeatures.length < 4) {
      setLocalFeatures([...localFeatures, ""]);
    }
  };

  const handleFeatureRemove = (index: number) => {
    const updatedFeatures = localFeatures.filter((_, i) => i !== index);
    setLocalFeatures(updatedFeatures);
    dispatch({ type: "SET_FEATURES", features: updatedFeatures });
  };

  return (
    <div className="mb-6 p-4">
      <div
        className={`${localFeatures.length ? "mb-10 flex flex-col gap-5" : ""}`}
      >
        {localFeatures.map((feature, index) => (
          <div key={index} className="flex items-center gap-4">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-300"
              placeholder={`ویژگی ${index + 1}`}
            />
            {localErrors[`feature-${index}`] && (
              <p className="text-red-500 mt-1">
                {localErrors[`feature-${index}`]}
              </p>
            )}
            <button
              type="button"
              onClick={() => handleFeatureRemove(index)}
              className="text-red-500 hover:text-red-600 transition-all"
            >
              <FaTrashAlt size={20} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={handleFeatureAdd}
        className="bg-blue-600 text-white py-2 px-4 w-full rounded-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
        disabled={localFeatures.length >= 4}
      >
        افزودن ویژگی جدید
      </button>
    </div>
  );
};

export default ProductOverview;
