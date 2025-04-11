import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { IoIosClose } from "react-icons/io";
import { FiPlus } from "react-icons/fi";
import SpecTemplateManager from "./SpecTemplateManager";

type SpecItem = {
  ProductSpecsId: number;
  Title: string;
  Description: string;
};

type Specs = {
  isChanged: boolean;
  data: SpecItem[];
};

type EditModalSpecsProps = {
  productId: number;
  productName: string;
  specs: Specs | null;
  setSpecs: (specs: Specs) => void;
};

const EditModalSpecs: React.FC<EditModalSpecsProps> = ({
  productId,
  productName,
  specs,
  setSpecs,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateManager, setShowTemplateManager] = useState(false);

  useEffect(() => {
    fetchSpecs();
  }, [productId]);

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

      setSpecs({
        isChanged: false,
        data: specData,
      });
    } catch (error) {
      console.error("Error fetching specs:", error);
      toast.error("خطا در دریافت مشخصات محصول");
      setSpecs({
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
    if (!specs) return;

    const newData = [...specs.data];
    newData[index][field] = value;
    setSpecs({
      isChanged: true,
      data: newData,
    });
  };

  const handleAddSpec = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!specs) return;

    setSpecs({
      isChanged: true,
      data: [
        ...specs.data,
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
    
    if (!specs) return;

    const newData = [...specs.data];
    newData.splice(index, 1);
    setSpecs({
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
    if (!specs) return;

    // Convert template specs to the correct format and add them to existing specs
    const formattedTemplateSpecs = templateSpecs.map(item => ({
      ProductSpecsId: 0,
      Title: item.title,
      Description: item.description,
    }));

    setSpecs({
      isChanged: true,
      data: [...specs.data, ...formattedTemplateSpecs],
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
          {specs && specs.data.length > 0 ? (
            specs.data.map((spec, index) => (
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
