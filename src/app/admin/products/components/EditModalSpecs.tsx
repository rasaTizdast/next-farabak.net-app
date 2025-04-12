import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { IoIosClose } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
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
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [internalSpecs, setInternalSpecs] = useState<SpecsInternal | null>(null);

  useEffect(() => {
    fetchSpecs();
  }, [productId]);

  // Convert from internal format to the API format
  useEffect(() => {
    if (internalSpecs && internalSpecs.isChanged) {
      const convertedSpecs: Specs = {
        data: internalSpecs.data.map(spec => ({
          ProductSpecsId: spec.ProductSpecsId,
          Name: productName,
          Title: spec.Title,
          Description: spec.Description,
          ProductId: productId,
          Available: true
        }))
      };
      setSpecs(convertedSpecs);
    }
  }, [internalSpecs]);

  // Convert from API format to the internal format
  useEffect(() => {
    if (specs && !internalSpecs) {
      setInternalSpecs({
        isChanged: false,
        data: specs.data.map(spec => ({
          ProductSpecsId: spec.ProductSpecsId,
          Title: spec.Title,
          Description: spec.Description
        }))
      });
    }
  }, [specs]);

  const fetchSpecs = async () => {
    if (!productId) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`/api/specs/${productId}`);
      const specData = response.data.map((spec: any) => ({
        ProductSpecsId: spec.ProductSpecsId,
        Title: spec.Title,
        Description: spec.Description,
      }));

      setInternalSpecs({
        isChanged: false,
        data: specData,
      });
    } catch (error) {
      console.error("Error fetching specs:", error);
      toast.error("خطا در دریافت مشخصات محصول");
      setInternalSpecs({
        isChanged: false,
        data: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpecChange = (
    index: number,
    field: "Title" | "Description",
    value: string
  ) => {
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
    const formattedTemplateSpecs = templateSpecs.map(item => ({
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

      <div className="col-span-1 sm:col-span-2 p-4 border border-gray-700 rounded-lg mt-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">مشخصات محصول</h3>
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
                  <label className="block mb-1 text-sm">عنوان</label>
                  <input
                    type="text"
                    value={spec.Title}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSpecChange(index, "Title", e.target.value);
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
                    value={spec.Description}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSpecChange(index, "Description", e.target.value);
                    }}
                    className="w-full p-2 rounded bg-gray-700 border border-gray-600"
                    placeholder="مثال: 100 گرم، 10×5 سانتی‌متر، فلزی، و غیره"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="flex items-end mb-1">
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
            <div className="text-center py-4 text-gray-400">
              هیچ مشخصاتی وجود ندارد. لطفاً با کلیک بر روی «افزودن مشخصات» یا انتخاب یک قالب، مشخصات را اضافه کنید.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EditModalSpecs;
