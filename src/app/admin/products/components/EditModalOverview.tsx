import React, { useEffect, useState } from "react";
import { Overview } from "../types";
import axios from "axios";

type Props = {
  ProductId: number;
  overviews: Overview | null;
  SetOverviews: (arg0: Overview) => void;
};

const EditModalOverview = ({ ProductId, SetOverviews, overviews }: Props) => {
  const [existingOverviews, setExistingOverviews] = useState<string[]>([]);

  useEffect(() => {
    axios
      .get(`/api/productOverview/getProductOverview/${+ProductId}`)
      .then((data) => {
        SetOverviews(data.data);
        // Initialize existingOverviews with non-empty properties
        const overviews = data.data;
        const nonEmptyOverviews = [
          overviews.Property1,
          overviews.Property2,
          overviews.Property3,
          overviews.Property4,
        ].filter(Boolean);
        setExistingOverviews(nonEmptyOverviews);
      });
  }, []);

  const inputHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (overviews) {
      const updatedOverviews = {
        ...overviews,
        [name]: value,
        isChanged: true,
      };
      SetOverviews(updatedOverviews);
      
      // Update existingOverviews state
      const propertyIndex = parseInt(name.replace('Property', '')) - 1;
      const newExistingOverviews = [...existingOverviews];
      newExistingOverviews[propertyIndex] = value;
      setExistingOverviews(newExistingOverviews);
    }
  };

  const addNewOverview = () => {
    if (existingOverviews.length >= 4) return;
    
    const newPropertyName = `Property${existingOverviews.length + 1}`;
    if (overviews) {
      const updatedOverviews = {
        ...overviews,
        [newPropertyName]: "",
        isChanged: true,
      };
      SetOverviews(updatedOverviews);
      setExistingOverviews([...existingOverviews, ""]);
    }
  };

  const removeOverview = (index: number) => {
    if (existingOverviews.length <= 1) return;

    const newOverviews = [...existingOverviews];
    newOverviews.splice(index, 1);
    setExistingOverviews(newOverviews);

    // Update the overviews state
    if (overviews) {
      const updatedOverviews = { ...overviews, isChanged: true };
      // Reset all properties
      ["Property1", "Property2", "Property3", "Property4"].forEach((prop) => {
        updatedOverviews[prop] = "";
      });
      // Set the remaining properties
      newOverviews.forEach((value, idx) => {
        updatedOverviews[`Property${idx + 1}`] = value;
      });
      SetOverviews(updatedOverviews);
    }
  };

  return (
    <div className="flex flex-col gap-5 col-span-1 sm:col-span-2 border-y-4 border-y-gray-200 my-5 py-5">
      <h3 className="font-bold mb-2">ویژگی‌های محصول</h3>
      
      {existingOverviews.map((overview, index) => (
        <div key={index} className="flex gap-2 items-center">
          <label className="block flex-1">
            <input
              type="text"
              name={`Property${index + 1}`}
              value={overviews?.[`Property${index + 1}`] || ""}
              onChange={inputHandler}
              className="bg-gray-700 border border-gray-800 rounded w-full p-2 mt-2"
              placeholder={`ویژگی ${index + 1} محصول را وارد کنید`}
            />
          </label>
          {existingOverviews.length > 1 && (
            <button
              type="button"
              onClick={() => removeOverview(index)}
              className="mt-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              حذف
            </button>
          )}
        </div>
      ))}

      {existingOverviews.length < 4 && (
        <button
          type="button"
          onClick={addNewOverview}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white mt-2"
        >
          افزودن ویژگی جدید
        </button>
      )}
    </div>
  );
};

export default EditModalOverview;
