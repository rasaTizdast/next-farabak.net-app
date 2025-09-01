import React, { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

import SpecTemplateManager from "../SpecTemplateManager";

type State = {
  specs: { title: string; description: string }[];
};

type SpecsProps = {
  state: State;
  dispatch: (action: any) => void;
  setErrors: (errors: any) => void;
  hasSubmitted?: boolean; // Add a prop to know if form was submitted
};

const Specs: React.FC<SpecsProps> = ({ state, dispatch, setErrors, hasSubmitted = false }) => {
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});

  // IMPORTANT: Validate fields with length restrictions
  const validateField = (field: "title" | "description", value: string): string => {
    if (field === "title") {
      if (!value.trim()) return "عنوان نمی‌تواند خالی باشد.";
      if (value.length > 100) return "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.";
    } else if (field === "description") {
      if (!value.trim()) return "توضیحات نمی‌تواند خالی باشد.";
      if (value.length > 4000) return "توضیحات نمی‌تواند بیشتر از 4000 کاراکتر باشد.";
    }
    return "";
  };

  // Immediately send updated errors to parent whenever localErrors changes
  useEffect(() => {
    const specsErrors: { [key: string]: string } = {};

    // Add all specs errors with the 'specs-' prefix
    Object.entries(localErrors).forEach(([key, value]) => {
      if (value) {
        specsErrors[`specs-${key}`] = value;
      }
    });

    // Send errors directly to parent - FORCE update
    setErrors((prevErrors: any) => {
      const newErrors = { ...prevErrors };

      // Remove all existing specs errors first
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("specs-")) {
          delete newErrors[key];
        }
      });

      // Add new specs errors
      Object.entries(specsErrors).forEach(([key, value]) => {
        newErrors[key] = value;
      });

      return newErrors;
    });

    // Log current errors if needed
    if (Object.keys(specsErrors).length > 0) {
    }
  }, [localErrors, setErrors]);

  // Initialize validation on mount and when specs change
  useEffect(() => {
    const initialErrors: { [key: string]: string } = {};

    state.specs.forEach((spec, index) => {
      const titleError = validateField("title", spec.title);
      const descError = validateField("description", spec.description);

      if (titleError) {
        initialErrors[`title-${index}`] = titleError;
      }

      if (descError) {
        initialErrors[`description-${index}`] = descError;
      }
    });

    setLocalErrors(initialErrors);
    // Don't log errors on initial render to avoid console clutter
  }, [state.specs]);

  // Add a new spec item
  const addSpec = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newSpecs = [...state.specs, { title: "", description: "" }];
    dispatch({ type: "SET_SPECS", specs: newSpecs });

    // Add validation for new empty fields
    const newIndex = state.specs.length;
    setLocalErrors((prev) => ({
      ...prev,
      [`title-${newIndex}`]: "عنوان نمی‌تواند خالی باشد.",
      [`description-${newIndex}`]: "توضیحات نمی‌تواند خالی باشد.",
    }));

    // Mark new fields as untouched initially
    setTouchedFields((prev) => ({
      ...prev,
      [`title-${newIndex}`]: false,
      [`description-${newIndex}`]: false,
    }));
  };

  // Remove a spec item
  const removeSpec = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    const newSpecs = state.specs.filter((_, i) => i !== index);
    dispatch({ type: "SET_SPECS", specs: newSpecs });

    // Clean up errors for removed item and reindex remaining errors
    setLocalErrors((prev) => {
      const updatedErrors = { ...prev };

      // Remove errors for deleted item
      delete updatedErrors[`title-${index}`];
      delete updatedErrors[`description-${index}`];

      // Reindex remaining errors
      const finalErrors: { [key: string]: string } = {};

      newSpecs.forEach((spec, newIndex) => {
        const oldIndex = newIndex >= index ? newIndex + 1 : newIndex;

        if (updatedErrors[`title-${oldIndex}`]) {
          finalErrors[`title-${newIndex}`] = updatedErrors[`title-${oldIndex}`];
        }

        if (updatedErrors[`description-${oldIndex}`]) {
          finalErrors[`description-${newIndex}`] = updatedErrors[`description-${oldIndex}`];
        }
      });

      return finalErrors;
    });

    // Also clean up and reindex touched fields
    setTouchedFields((prev) => {
      const updated = { ...prev };

      // Remove touched state for deleted item
      delete updated[`title-${index}`];
      delete updated[`description-${index}`];

      // Reindex remaining touched states
      const finalTouched: { [key: string]: boolean } = {};

      newSpecs.forEach((_, newIndex) => {
        const oldIndex = newIndex >= index ? newIndex + 1 : newIndex;

        if (updated[`title-${oldIndex}`] !== undefined) {
          finalTouched[`title-${newIndex}`] = updated[`title-${oldIndex}`];
        }

        if (updated[`description-${oldIndex}`] !== undefined) {
          finalTouched[`description-${newIndex}`] = updated[`description-${oldIndex}`];
        }
      });

      return finalTouched;
    });
  };

  // Handle change in spec fields
  const handleSpecChange = (index: number, field: "title" | "description", value: string) => {
    // Mark field as touched
    setTouchedFields((prev) => ({
      ...prev,
      [`${field}-${index}`]: true,
    }));

    // Update specs data
    const newSpecs = [...state.specs];
    newSpecs[index][field] = value;
    dispatch({ type: "SET_SPECS", specs: newSpecs });

    // Validate and update local errors
    const error = validateField(field, value);
    setLocalErrors((prev) => {
      const updated = { ...prev };
      if (error) {
        updated[`${field}-${index}`] = error;
      } else {
        delete updated[`${field}-${index}`];
      }
      return updated;
    });
  };

  // Handle template selection
  const handleTemplateSelect = (templateSpecs: { title: string; description: string }[]) => {
    // Merge existing specs with template specs
    const newSpecs = [...state.specs, ...templateSpecs];
    dispatch({ type: "SET_SPECS", specs: newSpecs });

    // Validate all new fields from template
    const startIndex = state.specs.length;

    setLocalErrors((prev) => {
      const newErrors = { ...prev };

      templateSpecs.forEach((spec, idx) => {
        const currentIndex = startIndex + idx;
        const titleError = validateField("title", spec.title);
        const descError = validateField("description", spec.description);

        if (titleError) {
          newErrors[`title-${currentIndex}`] = titleError;
        }

        if (descError) {
          newErrors[`description-${currentIndex}`] = descError;
        }
      });

      return newErrors;
    });

    // Mark new template fields as untouched
    setTouchedFields((prev) => {
      const newTouched = { ...prev };

      templateSpecs.forEach((_, idx) => {
        const currentIndex = startIndex + idx;
        newTouched[`title-${currentIndex}`] = false;
        newTouched[`description-${currentIndex}`] = false;
      });

      return newTouched;
    });
  };

  const openTemplateManager = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTemplateManager(true);
  };

  // Check if specs have any errors
  const hasSpecsErrors = () => {
    return Object.values(localErrors).some((error) => error !== "");
  };

  // Helper to determine if we should show an error for a specific field
  const shouldShowError = (field: string, index: number) => {
    const fieldKey = `${field}-${index}`;
    return (hasSubmitted || touchedFields[fieldKey]) && localErrors[fieldKey];
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">مشخصات محصول</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
              onClick={openTemplateManager}
            >
              مدیریت قالب‌ها
            </button>
            <button
              type="button"
              data-testid="add-spec-button"
              className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              onClick={addSpec}
            >
              <FiPlus size={18} />
              افزودن مشخصات
            </button>
          </div>
        </div>

        {/* Display overall validation status only after submission */}
        {hasSubmitted && hasSpecsErrors() && (
          <div className="mb-4 rounded-md bg-red-500 p-2 text-center text-sm text-white">
            لطفاً خطاهای مشخصات محصول را برطرف کنید.
          </div>
        )}

        <div className="space-y-4">
          {state.specs.map((spec, index) => (
            <div key={index} className="flex gap-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex-1">
                <label className="mb-1 block text-sm">عنوان</label>
                <input
                  type="text"
                  data-testid={`spec-title-${index}`}
                  value={spec.title}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSpecChange(index, "title", e.target.value);
                  }}
                  className={`w-full rounded border bg-gray-700 p-2 ${
                    shouldShowError("title", index) ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="مثال: وزن، ابعاد، مواد، و غیره"
                  onClick={(e) => e.stopPropagation()}
                />
                {shouldShowError("title", index) && (
                  <p className="mt-1 text-xs text-red-500">{localErrors[`title-${index}`]}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-sm">توضیحات</label>
                <input
                  type="text"
                  data-testid={`spec-description-${index}`}
                  value={spec.description}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSpecChange(index, "description", e.target.value);
                  }}
                  className={`w-full rounded border bg-gray-700 p-2 ${
                    shouldShowError("description", index) ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="مثال: 100 گرم، 10×5 سانتی‌متر، فلزی، و غیره"
                  onClick={(e) => e.stopPropagation()}
                />
                {shouldShowError("description", index) && (
                  <p className="mt-1 text-xs text-red-500">{localErrors[`description-${index}`]}</p>
                )}
              </div>
              <div className="mb-1 flex items-end">
                <button
                  type="button"
                  data-testid={`remove-spec-${index}`}
                  onClick={(e) => removeSpec(e, index)}
                  className="p-2 text-red-400 hover:text-red-300"
                >
                  <IoIosClose size={24} />
                </button>
              </div>
            </div>
          ))}

          {state.specs.length === 0 && (
            <div className="py-4 text-center text-gray-400">
              هیچ مشخصاتی وجود ندارد. لطفاً با کلیک بر روی «افزودن مشخصات» یا انتخاب یک قالب، مشخصات
              را اضافه کنید.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Specs;
