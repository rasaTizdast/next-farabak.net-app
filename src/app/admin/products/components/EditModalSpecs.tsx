import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

import { useApiFetch } from "@/hooks/useApiFetch";
import SpecTemplateManager from "./SpecTemplateManager";
import { Specs } from "../types";

type SpecItemLocal = {
  ProductSpecsId: number;
  Title: string;
  Description: string;
};

// Add the internal Specs type with the isChanged flag
type SpecsInternal = {
  isChanged: boolean;
  data: SpecItemLocal[];
};

type EditModalSpecsProps = {
  productId: number;
  productName: string;
  specs: Specs | null;
  setSpecs: React.Dispatch<React.SetStateAction<Specs | null>>;
};

const EditModalSpecs: React.FC<EditModalSpecsProps> = ({
  productId,
  productName,
  specs,
  setSpecs,
}) => {
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [internalSpecs, setInternalSpecs] = useState<SpecsInternal | null>(null);

  const {
    data: fetchedSpecs,
    loading: isLoading,
  } = useApiFetch<any[]>(productId ? `/api/specs/${productId}` : null);

  // eslint-disable-next-line react-compiler/set-state-in-effect
  useEffect(() => { if (fetchedSpecs && !internalSpecs) { setInternalSpecs({ isChanged: false, data: fetchedSpecs.map((s: any) => ({ ProductSpecsId: s.ProductSpecsId, Title: s.Title, Description: s.Description })) }); } }, [fetchedSpecs]);

  // eslint-disable-next-line react-compiler/set-state-in-effect
  useEffect(() => { if (internalSpecs && internalSpecs.isChanged) { setSpecs({ data: internalSpecs.data.map((s) => ({ ProductSpecsId: s.ProductSpecsId, Name: productName, Title: s.Title, Description: s.Description, ProductId: productId, Available: true })) }); } }, [internalSpecs]);

  // eslint-disable-next-line react-compiler/set-state-in-effect
  useEffect(() => { if (specs && !internalSpecs) { setInternalSpecs({ isChanged: false, data: specs.data.map((s) => ({ ProductSpecsId: s.ProductSpecsId, Title: s.Title, Description: s.Description })) }); } }, [specs]);

  const handleSpecChange = (index: number, field: "Title" | "Description", value: string) => {
    if (!internalSpecs) return;

    const newData = [...internalSpecs.data];
    newData[index][field] = value;
    setInternalSpecs({
      isChanged: true,
      data: newData,
    });
  };

  const handleAddSpec = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!internalSpecs) return;

    setInternalSpecs({
      isChanged: true,
      data: [
        ...internalSpecs.data,
        {
          ProductSpecsId: 0, // New item will have ID 0 until saved
          Title: "",
          Description: "",
        },
      ],
    });
  };

  const handleRemoveSpec = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!internalSpecs) return;

    const newData = [...internalSpecs.data];
    newData.splice(index, 1);
    setInternalSpecs({
      isChanged: true,
      data: newData,
    });
  };

  // Open template manager with stopPropagation
  const openTemplateManager = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTemplateManager(true);
  };

  // Handle template selection
  const handleTemplateSelect = (templateSpecs: { title: string; description: string }[]) => {
    if (!internalSpecs) return;

    // Convert template specs to the correct format and add them to existing specs
    const formattedTemplateSpecs = templateSpecs.map((item) => ({
      ProductSpecsId: 0,
      Title: item.title,
      Description: item.description,
    }));

    setInternalSpecs({
      isChanged: true,
      data: [...internalSpecs.data, ...formattedTemplateSpecs],
    });
  };

  if (isLoading) {
    return <div className="p-4 text-center">در حال بارگیری مشخصات...</div>;
  }

  return (
    <>
      {showTemplateManager && (
        <SpecTemplateManager
          onClose={() => setShowTemplateManager(false)}
          onTemplateSelect={handleTemplateSelect}
        />
      )}

      <div
        className="col-span-1 mt-4 rounded-lg border border-gray-700 p-4 sm:col-span-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">مشخصات محصول</h3>
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
              className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
              onClick={handleAddSpec}
            >
              <FiPlus size={18} />
              افزودن مشخصات
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {internalSpecs && internalSpecs.data.length > 0 ? (
            internalSpecs.data.map((spec, index) => (
              <div key={index} className="flex gap-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex-1">
                  <label className="mb-1 block text-sm">عنوان</label>
                  <input
                    type="text"
                    value={spec.Title}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSpecChange(index, "Title", e.target.value);
                    }}
                    className="w-full rounded border border-gray-600 bg-gray-700 p-2"
                    placeholder="مثال: وزن، ابعاد، مواد، و غیره"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-sm">توضیحات</label>
                  <input
                    type="text"
                    value={spec.Description}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSpecChange(index, "Description", e.target.value);
                    }}
                    className="w-full rounded border border-gray-600 bg-gray-700 p-2"
                    placeholder="مثال: 100 گرم، 10×5 سانتی‌متر، فلزی، و غیره"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="mb-1 flex items-end">
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSpec(e, index)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    <IoIosClose size={24} />
                  </button>
                </div>
              </div>
            ))
          ) : (
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

export default EditModalSpecs;
