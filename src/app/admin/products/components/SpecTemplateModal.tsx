import React, { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import { toast } from "react-hot-toast";
import axios from "axios";
import { CgSpinnerTwo } from "react-icons/cg";

type SpecTemplate = {
  SpecTemplateId: number;
  Name: string;
  Items: SpecTemplateItem[];
};

type SpecTemplateItem = {
  SpecTemplateItemId: number;
  SpecTemplateId: number;
  Title: string;
};

type SpecTemplateModalProps = {
  onClose: () => void;
  onTemplateAdded?: () => void;
  templateToEdit?: SpecTemplate | null;
};

const SpecTemplateModal: React.FC<SpecTemplateModalProps> = ({
  onClose,
  onTemplateAdded,
  templateToEdit,
}) => {
  const [templateName, setTemplateName] = useState("");
  const [items, setItems] = useState<{ Title: string }[]>([{ Title: "" }]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize state when editing an existing template
  useEffect(() => {
    if (templateToEdit) {
      setTemplateName(templateToEdit.Name);
      setItems(
        templateToEdit.Items && templateToEdit.Items.length > 0
          ? templateToEdit.Items.map((item) => ({ Title: item.Title }))
          : [{ Title: "" }]
      );
    }
  }, [templateToEdit]);

  const handleAddItem = () => {
    setItems([...items, { Title: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].Title = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Validation
    if (!templateName.trim()) {
      toast.error("لطفاً نام قالب را وارد کنید");
      return;
    }

    const nonEmptyItems = items.filter((item) => item.Title.trim() !== "");
    if (nonEmptyItems.length === 0) {
      toast.error("لطفاً حداقل یک مورد مشخصات وارد کنید");
      return;
    }

    setIsLoading(true);

    try {
      if (templateToEdit) {
        // Update existing template
        await axios.put(`/api/specTemplates/${templateToEdit.SpecTemplateId}`, {
          Name: templateName,
          Items: nonEmptyItems,
        });
        toast.success("قالب با موفقیت به‌روزرسانی شد");
      } else {
        // Create new template
        await axios.post("/api/specTemplates", {
          Name: templateName,
          Items: nonEmptyItems,
        });
        toast.success("قالب جدید با موفقیت ایجاد شد");
      }

      if (onTemplateAdded) {
        onTemplateAdded();
      }
      onClose();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("خطا در ذخیره‌سازی قالب. لطفاً دوباره تلاش کنید");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-gray-800 text-white rounded-xl shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-6 text-center">
          {templateToEdit ? "ویرایش قالب مشخصات" : "ایجاد قالب مشخصات جدید"}
        </h2>

        <div onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2">نام قالب</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              placeholder="نام قالب را وارد کنید"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <label>موارد مشخصات</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-blue-400 hover:text-blue-300"
                disabled={isLoading}
              >
                + افزودن مورد
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.Title}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                    placeholder="عنوان مشخصات را وارد کنید"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-400 hover:text-red-300"
                    disabled={isLoading || items.length <= 1}
                  >
                    <IoIosClose size={24} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <CgSpinnerTwo className="animate-spin" size={20} />
                  در حال پردازش...
                </>
              ) : templateToEdit ? (
                "به‌روزرسانی"
              ) : (
                "ایجاد"
              )}
            </button>
          </div>
        </div>

        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <IoIosClose size={30} />
        </button>
      </div>
    </div>
  );
};

export default SpecTemplateModal;
