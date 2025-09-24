"use client";

import { Input, Button, Switch, Form } from "antd";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoMdClose } from "react-icons/io";

const { TextArea } = Input;

interface NewFaqProps {
  onClose: () => void;
}

const NewFaq: React.FC<NewFaqProps> = ({ onClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    if (!values.Q || !values.A) {
      toast.error("لطفاً سوال و پاسخ را وارد کنید");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Q: values.Q,
          A: values.A,
          Available: true,
        }),
      });

      if (response.ok) {
        toast.success("سوال جدید با موفقیت ایجاد شد");
        form.resetFields();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(`خطا: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error creating FAQ:", error);
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-gray-800 shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-xl font-bold text-gray-200">افزودن سوال متداول جدید</h2>
          <Button
            type="text"
            icon={<IoMdClose size={24} />}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          />
        </div>

        <div className="p-6">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ Available: true }}
          >
            <Form.Item
              name="Q"
              label={<span className="text-gray-300">سوال</span>}
              rules={[
                {
                  required: true,
                  message: "لطفاً سوال را وارد کنید",
                },
              ]}
            >
              <Input placeholder="سوال را وارد کنید" />
            </Form.Item>

            <Form.Item
              name="A"
              label={<span className="text-gray-300">پاسخ</span>}
              rules={[
                {
                  required: true,
                  message: "لطفاً پاسخ را وارد کنید",
                },
              ]}
            >
              <TextArea placeholder="پاسخ را وارد کنید" rows={6} className="resize-none" />
            </Form.Item>

            <Form.Item
              name="Available"
              valuePropName="checked"
              label={<span className="text-gray-300">نمایش به کاربران</span>}
            >
              <Switch />
            </Form.Item>

            <div className="mt-6 flex justify-end gap-2">
              <Button onClick={onClose}>انصراف</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                ذخیره
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default NewFaq;
