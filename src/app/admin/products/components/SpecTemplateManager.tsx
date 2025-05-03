import React, { useState, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import { toast } from "react-hot-toast";
import axios from "axios";
import { CgSpinnerTwo } from "react-icons/cg";
import { FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import SpecTemplateModal from "./SpecTemplateModal";

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

type SpecTemplateManagerProps = {
  onClose: () => void;
  onTemplateSelect: (items: { title: string; description: string }[]) => void;
};

const SpecTemplateManager: React.FC<SpecTemplateManagerProps> = ({
  onClose,
  onTemplateSelect,
}) => {
  const [templates, setTemplates] = useState<SpecTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<SpecTemplate | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  // Fetch all templates
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/specTemplates");
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("خطا در دریافت قالب‌ها");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = () => {
    setTemplateToEdit(null);
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template: SpecTemplate) => {
    setTemplateToEdit(template);
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (confirm("آیا از حذف این قالب اطمینان دارید؟")) {
      setDeleteLoading(templateId);
      try {
        await axios.delete(`/api/specTemplates/${templateId}`);
        toast.success("قالب با موفقیت حذف شد");
        fetchTemplates();
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("خطا در حذف قالب");
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleSelectTemplate = async (templateId: number) => {
    try {
      const response = await axios.get(`/api/specTemplates/${templateId}`);
      const template = response.data;

      // Convert template items to the format expected by the specs component
      const specItems = template.Items.map((item: SpecTemplateItem) => ({
        title: item.Title,
        description: "",
      }));

      onTemplateSelect(specItems);
      onClose();
    } catch (error) {
      console.error("Error selecting template:", error);
      toast.error("خطا در انتخاب قالب");
    }
  };

  return (
    <>
      {showTemplateModal && (
        <SpecTemplateModal
          onClose={() => setShowTemplateModal(false)}
          onTemplateAdded={fetchTemplates}
          templateToEdit={templateToEdit}
        />
      )}

      <div
        className="fixed inset-0 z-[55] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-gray-800 text-white rounded-xl shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-bold mb-6 text-center">
            مدیریت قالب‌های مشخصات
          </h2>

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateTemplate();
              }}
              className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-500 transition-colors flex items-center gap-2"
            >
              <FiPlus />
              ایجاد قالب جدید
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <CgSpinnerTwo className="animate-spin" size={40} />
            </div>
          ) : templates.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              هیچ قالبی یافت نشد. لطفاً یک قالب جدید ایجاد کنید.
            </div>
          ) : (
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.SpecTemplateId}
                  className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                >
                  <div className="flex-grow">
                    <h3 className="font-bold text-lg">{template.Name}</h3>
                    <p className="text-gray-400 text-sm">
                      {template.Items && template.Items.length
                        ? template.Items.length
                        : 0}{" "}
                      مورد مشخصات
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectTemplate(template.SpecTemplateId);
                      }}
                      className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-500 transition-colors"
                    >
                      انتخاب
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditTemplate(template);
                      }}
                      className="p-1 bg-yellow-600 rounded hover:bg-yellow-500 transition-colors"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteTemplate(template.SpecTemplateId);
                      }}
                      className="p-1 bg-red-600 rounded hover:bg-red-500 transition-colors"
                      disabled={deleteLoading === template.SpecTemplateId}
                    >
                      {deleteLoading === template.SpecTemplateId ? (
                        <CgSpinnerTwo className="animate-spin" size={16} />
                      ) : (
                        <FiTrash />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
            >
              بستن
            </button>
          </div>

          <button
            type="button"
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
    </>
  );
};

export default SpecTemplateManager;
