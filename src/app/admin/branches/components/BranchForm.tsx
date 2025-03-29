import React from 'react';
import { Form, Input, Select, Button } from 'antd';
import { User } from './types';

interface BranchFormProps {
  form: any;
  onFinish: (values: any) => void;
  onCancel: () => void;
  users?: User[];
  isEdit?: boolean;
  submitButtonText: string;
}

const BranchForm: React.FC<BranchFormProps> = ({
  form,
  onFinish,
  onCancel,
  users = [],
  isEdit = false,
  submitButtonText
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="mt-4 text-gray-100"
    >
      {!isEdit && (
        <Form.Item
          name="userId"
          label={<span className="text-gray-300">انتخاب کاربر</span>}
          rules={[{ required: true, message: "لطفاً یک کاربر انتخاب کنید" }]}
        >
          <Select
            placeholder="انتخاب کاربر"
            optionFilterProp="children"
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toString().toLowerCase() ?? "").includes(
                input.toLowerCase()
              )
            }
            options={users.map((user) => ({
              value: user.UserID,
              label: `${user.FirstName || ""} ${user.LastName || ""} (${
                user.PhoneNumber || "بدون شماره تلفن"
              })`,
            }))}
            className="w-full text-right dark-select"
            popupClassName="dark-dropdown"
          />
        </Form.Item>
      )}

      <Form.Item
        name="name"
        label={<span className="text-gray-300">نام شعبه</span>}
        rules={[{ required: true, message: "لطفاً نام شعبه را وارد کنید" }]}
      >
        <Input
          placeholder="نام شعبه را وارد کنید"
          className="text-right dark-input"
        />
      </Form.Item>

      <Form.Item
        name="location"
        label={<span className="text-gray-300">کد مکان</span>}
        rules={[
          { required: true, message: "لطفاً کد مکان را وارد کنید" },
          {
            pattern: /^[a-zA-Z0-9_-]+$/,
            message: "فقط حروف انگلیسی، اعداد و علامت‌های - و _ مجاز هستند",
          },
        ]}
      >
        <Input
          placeholder="کد مکان را وارد کنید"
          maxLength={10}
          className="text-right dark-input"
        />
      </Form.Item>

      <Form.Item className="flex justify-end mb-0">
        <Button
          onClick={onCancel}
          className="ml-2 dark-button-secondary"
        >
          انصراف
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          className="bg-blue-600 hover:bg-blue-700 border-blue-700"
        >
          {submitButtonText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default BranchForm; 