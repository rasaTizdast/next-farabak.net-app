import React, { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import SpecTemplateManager from "../SpecTemplateManager";

type State = {
  specs: { title: string; description: string }[];
};

type SpecsProps = {
  state: State;
  dispatch: (action: any) => void;
  setErrors: (errors: any) => void;
};

const Specs: React.FC<SpecsProps> = ({ state, dispatch, setErrors }) => {
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  // Add a new spec item
  const addSpec = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newSpecs = [
      ...state.specs,
      { title: "", description: "" },
    ];
    dispatch({ type: "SET_SPECS", specs: newSpecs });
  };

  // Remove a spec item
  const removeSpec = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newSpecs = state.specs.filter((_, i) => i !== index);
    dispatch({ type: "SET_SPECS", specs: newSpecs });
  };

  // Handle change in spec fields
  const handleSpecChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const newSpecs = [...state.specs];
    newSpecs[index][field] = value;
    dispatch({ type: "SET_SPECS", specs: newSpecs });
  };

  // Handle template selection
  const handleTemplateSelect = (templateSpecs: { title: string; description: string }[]) => {
    // Merge existing specs with template specs
    const newSpecs = [...state.specs, ...templateSpecs];
    dispatch({ type: "SET_SPECS", specs: newSpecs });
  };

  const openTemplateManager = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTemplateManager(true);
  };

  return (
    <>
      {showTemplateManager && (
        <SpecTemplateManager 
          onClose={() => setShowTemplateManager(false)}
          onTemplateSelect={handleTemplateSelect}
        />
      )}

      <div className="p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">مشخصات محصول</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm flex items-center gap-1"
              onClick={openTemplateManager}
            >
              مدیریت قالب‌ها
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm flex items-center gap-1"
              onClick={addSpec}
            >
              <FiPlus size={18} />
              افزودن مشخصات
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {state.specs.map((spec, index) => (
            <div key={index} className="flex gap-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex-1">
                <label className="block mb-1 text-sm">عنوان</label>
                <input
                  type="text"
                  value={spec.title}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSpecChange(index, "title", e.target.value);
                  }}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                  placeholder="مثال: وزن، ابعاد، مواد، و غیره"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 text-sm">توضیحات</label>
                <input
                  type="text"
                  value={spec.description}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSpecChange(index, "description", e.target.value);
                  }}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                  placeholder="مثال: 100 گرم، 10×5 سانتی‌متر، فلزی، و غیره"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex items-end mb-1">
                <button
                  type="button"
                  onClick={(e) => removeSpec(e, index)}
                  className="p-2 text-red-400 hover:text-red-300"
                >
                  <IoIosClose size={24} />
                </button>
              </div>
            </div>
          ))}

          {state.specs.length === 0 && (
            <div className="text-center py-4 text-gray-400">
              هیچ مشخصاتی وجود ندارد. لطفاً با کلیک بر روی «افزودن مشخصات» یا انتخاب یک قالب، مشخصات را اضافه کنید.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Specs;
