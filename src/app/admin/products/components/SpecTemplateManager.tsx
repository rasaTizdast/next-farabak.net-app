import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { CgSpinnerTwo } from "react-icons/cg";
import { FiEdit, FiTrash, FiPlus } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";
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

const SpecTemplateManager: React.FC<SpecTemplateManagerProps> = ({ onClose, onTemplateSelect }) => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateToEdit, setTemplateToEdit] = useState<SpecTemplate | null>(null);

  const {
    data: templates,
    loading: isLoading,
    refetch: fetchTemplates,
  } = useApiFetch<SpecTemplate[]>("/api/specTemplates");

  const { mutate: deleteTemplate, loading: deleteLoading } = useApiMutation("delete");

  const handleCreateTemplate = () => {
    setTemplateToEdit(null);
    setShowTemplateModal(true);
  };

  const handleEditTemplate = (template: SpecTemplate) => {
    setTemplateToEdit(template);
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm("آیا از حذف این قالب اطمینان دارید؟")) return;

    const res = await deleteTemplate(`/api/specTemplates/${templateId}`);
    if (res) {
      toast.success("قالب با موفقیت حذف شد");
      fetchTemplates();
    }
  };

  const handleSelectTemplate = async (templateId: number) => {
    const response = await axios.get(`/api/specTemplates/${templateId}`).catch(() => null);
    if (!response) {
      toast.error("خطا در انتخاب قالب");
      return;
    }

    const template = response.data;
    // Convert template items to the format expected by the specs component
    const specItems = template.Items.map((item: SpecTemplateItem) => ({
      title: item.Title,
      description: "",
    }));

    onTemplateSelect(specItems);
    onClose();
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
          className="relative max-h-[90vh] w-full max-w-3xl animate-fade-in overflow-y-auto rounded-xl bg-gray-800 p-6 text-white shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="mb-6 text-center text-xl font-bold">مدیریت قالب‌های مشخصات</h2>

          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCreateTemplate();
              }}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 transition-colors hover:bg-green-500"
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
                  className="flex items-center justify-between rounded-lg bg-gray-700 p-4"
                >
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold">{template.Name}</h3>
                    <p className="text-sm text-gray-400">
                      {template.Items && template.Items.length ? template.Items.length : 0} مورد
                      مشخصات
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSelectTemplate(template.SpecTemplateId);
                      }}
                      className="rounded bg-blue-600 px-3 py-1 transition-colors hover:bg-blue-500"
                    >
                      انتخاب
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEditTemplate(template);
                      }}
                      className="rounded bg-yellow-600 p-1 transition-colors hover:bg-yellow-500"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteTemplate(template.SpecTemplateId);
                      }}
                      className="rounded bg-red-600 p-1 transition-colors hover:bg-red-500"
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? (
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
              className="rounded-lg bg-gray-600 px-4 py-2 transition-colors hover:bg-gray-500"
            >
              بستن
            </button>
          </div>

          <button
            type="button"
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
    </>
  );
};

export default SpecTemplateManager;
