"use client";

import { Input, Button, Modal, Table, Tooltip, Space, Badge } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";

import { adminColors } from "@/constants/adminColors";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

const { TextArea } = Input;

function truncateText(text: string | null, maxLength: number) {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

interface FaqEditorProps {
  onClose: () => void;
}

interface FAQ {
  FaqDetailsid: number;
  Q: string | null;
  A: string | null;
  Available: boolean | null;
  InsertDate: string | null;
  ModifyDate: string | null;
}

const FaqEditor: React.FC<FaqEditorProps> = ({ onClose }) => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [formData, setFormData] = useState({
    Q: "",
    A: "",
    Available: true, // Always true
  });

  const { data: faqsData } = useApiFetch<{ faqs: FAQ[] }>("/api/admin/faqs");
  const { mutate: deleteFaqMutate } = useApiMutation("delete");
  const { mutate: saveFaqMutate } = useApiMutation("post");
  const { mutate: updateFaqMutate } = useApiMutation("put");
  const initializedRef = useRef(false);

  const loading = !faqsData;

  useEffect(() => {
    if (faqsData && !initializedRef.current) {
      initializedRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialize local editable faqs state from fetched data once, guarded by ref.
      setFaqs(faqsData.faqs);
    }
  }, [faqsData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle editing a FAQ
  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      Q: faq.Q || "",
      A: faq.A || "",
      Available: true, // Always true
    });
    setModalVisible(true);
  };

  // Handle creating a new FAQ
  const handleCreate = () => {
    setEditingFaq(null);
    setFormData({
      Q: "",
      A: "",
      Available: true, // Always true
    });
    setModalVisible(true);
  };

  // Handle deleting a FAQ
  const handleDelete = async (id: number) => {
    if (!window.confirm("آیا از حذف این سوال اطمینان دارید؟")) {
      return;
    }

    const res = await deleteFaqMutate(`/api/admin/faqs/${id}`);
    if (res) {
      toast.success("سوال با موفقیت حذف شد");
      setFaqs((prev) => prev.filter((f) => f.FaqDetailsid !== id));
    } else {
      toast.error("خطا در حذف سوال");
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.Q || !formData.A) {
      toast.error("لطفاً سوال و پاسخ را وارد کنید");
      return;
    }

    if (formData.Q.length > 500) {
      toast.error("سوال نمی‌تواند بیش از 500 کاراکتر باشد");
      return;
    }

    if (formData.A.length > 1000) {
      toast.error("پاسخ نمی‌تواند بیش از 1000 کاراکتر باشد");
      return;
    }

    const payload = { ...formData, Available: true };
    let res;
    if (editingFaq) {
      res = await updateFaqMutate(`/api/admin/faqs/${editingFaq.FaqDetailsid}`, payload);
    } else {
      res = await saveFaqMutate("/api/admin/faqs", payload);
    }

    if (res) {
      toast.success(editingFaq ? "سوال با موفقیت بروزرسانی شد" : "سوال جدید با موفقیت ایجاد شد");
      setModalVisible(false);
      const fetchRes = await fetch("/api/admin/faqs");
      if (!fetchRes.ok) {
        throw new Error(`HTTP ${fetchRes.status}`);
      }
      const data = await fetchRes.json();
      setFaqs(data.faqs);
    } else {
      toast.error("خطا در ذخیره سوال");
    }
  };

  // Count FAQs
  const totalFaqsCount = faqs.length;

  // Table columns
  const columns = [
    {
      title: "سوال",
      dataIndex: "Q",
      key: "Q",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="text-gray-200">{truncateText(text, 35)}</span>
        </Tooltip>
      ),
    },
    {
      title: "پاسخ",
      dataIndex: "A",
      key: "A",
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <span className="text-gray-300">{truncateText(text, 40)}</span>
        </Tooltip>
      ),
    },
    {
      title: "عملیات",
      key: "action",
      width: 150,
      render: (_: unknown, record: FAQ) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<FaEdit size={16} />}
            onClick={() => handleEdit(record)}
            aria-label="ویرایش سوال"
            className="text-blue-400 hover:text-blue-300"
          />
          <Button
            type="text"
            icon={<FaTrash size={16} />}
            onClick={() => handleDelete(record.FaqDetailsid)}
            aria-label="حذف سوال"
            className="text-red-400 hover:text-red-300"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 p-4">
          <div>
            <h2 className="text-xl font-bold text-gray-100">مدیریت سوالات متداول</h2>
            <p className="mt-1 text-sm text-gray-400">{totalFaqsCount} سوال موجود</p>
          </div>
          <Button
            type="text"
            icon={<IoMdClose size={24} />}
            onClick={onClose}
            aria-label="بستن"
            className="text-gray-400 hover:text-gray-200"
          />
        </div>

        <div className="flex-1 overflow-auto bg-gray-800 p-4">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-200">لیست سوالات متداول</h3>
              <Badge
                count={totalFaqsCount}
                showZero
                style={{ backgroundColor: adminColors.info }}
              />
            </div>
            <Button
              type="primary"
              icon={<FaPlus />}
              onClick={handleCreate}
              className="border-none bg-blue-600 text-white hover:bg-blue-700"
            >
              افزودن سوال جدید
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={faqs}
            rowKey="FaqDetailsid"
            loading={loading}
            pagination={false} // No pagination
            scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
            className="dark-table [&_.ant-table-cell-scrollbar]:shadow-none!"
            locale={{
              emptyText: <span className="text-gray-400">سوالی موجود نیست</span>,
            }}
            rowClassName={() => "bg-gray-750 border-b border-gray-700 hover:bg-gray-700"}
          />
        </div>
      </div>

      {/* FAQ Edit/Create Modal */}
      <Modal
        title={null}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        className="dark-modal [&_.ant-btn]:border-gray-600! [&_.ant-btn]:bg-gray-700! [&_.ant-btn]:text-gray-200! hover:[&_.ant-btn]:border-gray-500! hover:[&_.ant-btn]:bg-gray-600! [&_.ant-btn-primary]:border-blue-600! [&_.ant-btn-primary]:bg-blue-600! hover:[&_.ant-btn-primary]:border-blue-700! hover:[&_.ant-btn-primary]:bg-blue-700! [&_.ant-input-affix-wrapper-focused]:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]! [&_.ant-input-affix-wrapper:focus]:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]! [&_.ant-input-affix-wrapper:hover]:border-gray-500! [&_.ant-input-focused]:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]! [&_.ant-input-number-input::placeholder]:text-gray-400! [&_.ant-input-textarea-show-count::after]:text-gray-200! [&_.ant-input::placeholder]:text-gray-400! [&_.ant-input:focus]:shadow-[0_0_0_2px_rgba(59,130,246,0.2)]! [&_.ant-input:hover]:border-gray-500! [&_.ant-modal-body]:p-0! [&_.ant-modal-content]:bg-transparent! [&_.ant-modal-content]:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]! [&_.ant-select-selector:hover]:border-gray-500!"
        closeIcon={null}
        centered
        styles={{
          content: {
            backgroundColor: adminColors.panelDeep, // bg-gray-900
            borderRadius: "0.75rem",
            border: `1px solid ${adminColors.border}`, // border-gray-700
            padding: 0,
            overflow: "hidden",
          },
          mask: {
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        <div className="rounded-lg bg-gray-900 px-6 py-5">
          <div className="mb-4">
            <h3 className="mb-4 text-xl font-semibold text-gray-100">
              {editingFaq ? "ویرایش سوال" : "افزودن سوال جدید"}
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="faq-question" className="mb-1 block text-gray-300">
                سوال
              </label>
              <Input
                id="faq-question"
                name="Q"
                value={formData.Q}
                onChange={handleInputChange}
                placeholder="سوال را وارد کنید"
                maxLength={500}
                showCount
                aria-label="سوال"
                className="border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                style={{
                  backgroundColor: adminColors.panel,
                  borderColor: adminColors.borderLight,
                  color: adminColors.textLight,
                }}
              />
            </div>

            <div>
              <label htmlFor="faq-answer" className="mb-1 block text-gray-300">
                پاسخ
              </label>
              <TextArea
                id="faq-answer"
                name="A"
                value={formData.A}
                onChange={handleInputChange}
                placeholder="پاسخ را وارد کنید"
                maxLength={1000}
                showCount
                rows={6}
                aria-label="پاسخ"
                className="resize-none border-gray-600 bg-gray-700 text-gray-200 placeholder-gray-400"
                style={{
                  backgroundColor: adminColors.panel,
                  borderColor: adminColors.borderLight,
                  color: adminColors.textLight,
                }}
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                htmlType="button"
                onClick={() => setModalVisible(false)}
                className="border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500 hover:text-white"
              >
                انصراف
              </Button>
              <Button
                htmlType="button"
                type="primary"
                onClick={handleSubmit}
                className="border-none bg-blue-600 hover:bg-blue-700"
              >
                ذخیره
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FaqEditor;
