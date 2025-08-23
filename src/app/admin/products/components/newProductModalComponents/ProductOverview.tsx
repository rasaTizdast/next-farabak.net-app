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

  // Enhanced error reporting to parent component
  useEffect(() => {
    // Format errors with proper prefixes for parent component
    const formattedErrors = {};

    // Add feature-specific errors
    Object.entries(localErrors).forEach(([key, value]) => {
      if (value) {
        formattedErrors[`features-${key}`] = value;
      }
    });

    // Check if any features exist, and if not, add a general features error
    if (localFeatures.length === 0) {
      formattedErrors["features"] = "حداقل یک ویژگی الزامی است";
    } else {
      // If we have features, check if any of them are invalid
      const hasInvalidFeatures = localFeatures.some(
        (feature, index) => !!localErrors[`feature-${index}`]
      );

      if (hasInvalidFeatures) {
        formattedErrors["features"] = "لطفاً خطاهای ویژگی‌ها را برطرف کنید";
      } else {
        // No errors, clear any existing features error
        formattedErrors["features"] = "";
      }
    }

    // Send errors to parent component
    setErrors((prev) => {
      const newErrors = { ...prev };

      // First, remove all existing feature errors
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("features-") || key === "features") {
          delete newErrors[key];
        }
      });

      // Then add the current feature errors
      return { ...newErrors, ...formattedErrors };
    });

    // Log errors if needed
    if (Object.keys(formattedErrors).length > 0) {
      console.log("Feature validation errors:", formattedErrors);
    }
  }, [localErrors, localFeatures, setErrors]);

  // Initialize validation on component mount and when features change from parent
  useEffect(() => {
    setLocalFeatures(state.features);

    // Validate all features
    const initialErrors = {};
    state.features.forEach((feature, index) => {
      const error = validateField(feature);
      if (error) {
        initialErrors[`feature-${index}`] = error;
      }
    });

    setLocalErrors(initialErrors);
  }, [state.features]);

  const validateField = (value: string) => {
    let error = "";
    if (!value.trim()) error = "ویژگی نمی‌تواند خالی باشد.";
    else if (value.length > 300) error = "ویژگی نمی‌تواند بیشتر از ۳۰۰ کاراکتر باشد.";
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
      const newIndex = localFeatures.length;
      const updatedFeatures = [...localFeatures, ""];
      setLocalFeatures(updatedFeatures);
      dispatch({ type: "SET_FEATURES", features: updatedFeatures });

      // Add validation error for the new empty feature
      setLocalErrors((prev) => ({
        ...prev,
        [`feature-${newIndex}`]: "ویژگی نمی‌تواند خالی باشد.",
      }));
    }
  };

  const handleFeatureRemove = (index: number) => {
    const updatedFeatures = localFeatures.filter((_, i) => i !== index);
    setLocalFeatures(updatedFeatures);
    dispatch({ type: "SET_FEATURES", features: updatedFeatures });

    // Remove error for deleted feature and reindex remaining errors
    const newErrors = {};
    Object.entries(localErrors).forEach(([key, value]) => {
      const match = key.match(/feature-(\d+)/);
      if (match) {
        const errorIndex = parseInt(match[1]);
        if (errorIndex < index) {
          newErrors[key] = value;
        } else if (errorIndex > index) {
          newErrors[`feature-${errorIndex - 1}`] = value;
        }
      }
    });
    setLocalErrors(newErrors);
  };

  return (
    <div className="mb-6 p-4">
      <div className={`${localFeatures.length ? "mb-10 flex flex-col gap-5" : ""}`}>
        {localFeatures.map((feature, index) => (
          <div key={index} className="flex items-center gap-4">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleFeatureChange(index, e.target.value)}
              className={`w-full rounded-lg border bg-gray-700 p-3 ${
                localErrors[`feature-${index}`] ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={`ویژگی ${index + 1}`}
            />
            {localErrors[`feature-${index}`] && (
              <p className="mt-1 text-red-500">{localErrors[`feature-${index}`]}</p>
            )}
            <button
              type="button"
              onClick={() => handleFeatureRemove(index)}
              className="text-red-500 transition-all hover:text-red-600"
            >
              <FaTrashAlt size={20} />
            </button>
          </div>
        ))}
      </div>
      {localFeatures.length === 0 && (
        <div className="mb-4 text-center text-red-500">حداقل یک ویژگی الزامی است</div>
      )}
      <button
        type="button"
        onClick={handleFeatureAdd}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
        disabled={localFeatures.length >= 4}
      >
        افزودن ویژگی جدید
      </button>
    </div>
  );
};

export default ProductOverview;
