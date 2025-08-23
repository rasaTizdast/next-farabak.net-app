"use client";

import { Form, Input, Card } from "antd";
import React from "react";

import { Invoice } from "../../types";

interface CustomerInfoStepProps {
  invoice: Partial<Invoice>;
  onUpdate: (values: Partial<Invoice>) => void;
}

const CustomerInfoStep: React.FC<CustomerInfoStepProps> = ({ invoice, onUpdate }) => {
  const [form] = Form.useForm();

  // Initialize form values
  React.useEffect(() => {
    form.setFieldsValue({
      Fullname: invoice.Fullname,
      Phonenumber: invoice.Phonenumber,
    });
  }, [form, invoice]);

  // Handle form value changes
  const handleValuesChange = (changedValues: any) => {
    onUpdate(changedValues);
  };

  return (
    <Card className="border-0 bg-slate-900 shadow-md">
      <h3 className="mb-4 text-lg font-medium text-white">اطلاعات خریدار را وارد کنید</h3>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        initialValues={{
          Fullname: invoice.Fullname,
          Phonenumber: invoice.Phonenumber,
        }}
      >
        <Form.Item
          name="Fullname"
          label={<span className="text-white">نام و نام خانوادگی</span>}
          rules={[
            {
              required: true,
              message: "لطفا نام و نام خانوادگی خریدار را وارد کنید",
            },
          ]}
        >
          <Input
            placeholder="نام و نام خانوادگی خریدار"
            className="dark-input"
            style={{
              backgroundColor: "#374151",
              borderColor: "#4b5563",
              color: "#e5e7eb",
            }}
          />
        </Form.Item>

        <Form.Item
          name="Phonenumber"
          label={<span className="text-white">شماره تماس</span>}
          rules={[
            { required: true, message: "لطفا شماره تماس خریدار را وارد کنید" },
            {
              pattern: /^09\d{9}$/,
              message: "شماره تماس معتبر نیست",
            },
          ]}
        >
          <Input
            placeholder="مثال: 09123456789"
            className="dark-input"
            style={{
              backgroundColor: "#374151",
              borderColor: "#4b5563",
              color: "#e5e7eb",
            }}
          />
        </Form.Item>
      </Form>

      <style jsx global>{`
        .dark-input .ant-input::placeholder {
          color: #9ca3af;
        }
      `}</style>
    </Card>
  );
};

export default CustomerInfoStep;
