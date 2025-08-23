import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CgSpinnerTwo } from "react-icons/cg";
import { IoIosClose } from "react-icons/io";

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
        className="relative max-h-[90vh] w-full max-w-2xl animate-fade-in overflow-y-auto rounded-xl bg-gray-800 p-6 text-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-center text-xl font-bold">
          {templateToEdit ? "ویرایش قالب مشخصات" : "ایجاد قالب مشخصات جدید"}
        </h2>

        <div onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block">نام قالب</label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white"
              placeholder="نام قالب را وارد کنید"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <div className="mb-2 flex justify-between">
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
                    className="flex-grow rounded-md border border-gray-600 bg-gray-700 p-2 text-white"
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
              className="rounded-lg bg-gray-600 px-4 py-2 transition-colors hover:bg-gray-500"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 transition-colors hover:bg-blue-500"
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
          className="absolute right-2 top-2 text-gray-400 hover:text-white"
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
