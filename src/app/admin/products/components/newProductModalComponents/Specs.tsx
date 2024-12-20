import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";

type Spec = {
  title: string;
  description: string;
};

type State = {
  specs: Spec[];
};

type Props = {
  state: State;
  dispatch: React.Dispatch<any>;
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
};

const Specs = ({ state, dispatch, setErrors }: Props) => {
  const [localSpecs, setLocalSpecs] = useState<Spec[]>(state.specs);
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setErrors((prev) => ({ ...prev, ...localErrors }));
  }, [localErrors, setErrors]);

  const validateField = (field: string, value: string) => {
    let error = "";
    if (field === "title") {
      if (!value.trim()) error = "عنوان نمی‌تواند خالی باشد.";
      else if (value.length > 100) error = "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.";
      else if (!/^[a-zA-Z0-9\u0600-\u06FF\s_-]+$/.test(value)) error = "عنوان فقط می‌تواند شامل حروف انگلیسی، فارسی و اعداد باشد.";
    } else if (field === "description") {
      if (!value.trim()) error = "توضیحات نمی‌تواند خالی باشد.";
      else if (value.length > 1000) error = "توضیحات نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
    }
    return error;
  };

  const handleSpecChange = (index: number, field: string, value: string) => {
    const error = validateField(field, value);
    setLocalErrors((prev) => ({ ...prev, [`${field}-${index}`]: error }));

    const updatedSpecs = [...localSpecs];
    updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
    setLocalSpecs(updatedSpecs);
    dispatch({ type: "SET_SPECS", specs: updatedSpecs });
  };

  const handleAddSpec = () => {
    if (localSpecs.length < 12) {
      setLocalSpecs([...localSpecs, { title: "", description: "" }]);
    }
  };

  const handleRemoveSpec = (index: number) => {
    const updatedSpecs = localSpecs.filter((_, i) => i !== index);
    setLocalSpecs(updatedSpecs);
    dispatch({ type: "SET_SPECS", specs: updatedSpecs });
  };

  return (
    <div className="mb-6 p-4">
      {localSpecs.map((spec, index) => (
        <div
          key={index}
          className="mb-10 flex flex-col gap-5 bg-gray-800 p-4 rounded-md shadow-lg"
        >
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={spec.title}
              onChange={(e) => handleSpecChange(index, "title", e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-300"
              placeholder={`عنوان مشخصه ${index + 1}`}
            />
            {localErrors[`title-${index}`] && <p className="text-red-500 mt-1">{localErrors[`title-${index}`]}</p>}
            <button
              type="button"
              onClick={() => handleRemoveSpec(index)}
              className="text-red-500 hover:text-red-600 transition-all"
            >
              <FaTrashAlt size={20} />
            </button>
          </div>
          <textarea
            value={spec.description}
            onChange={(e) =>
              handleSpecChange(index, "description", e.target.value)
            }
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-300"
            placeholder={`توضیحات مشخصه ${index + 1}`}
          />
          {localErrors[`description-${index}`] && <p className="text-red-500 mt-1">{localErrors[`description-${index}`]}</p>}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddSpec}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
        disabled={localSpecs.length >= 12}
      >
        افزودن مشخصه جدید
      </button>
    </div>
  );
};

export default Specs;
