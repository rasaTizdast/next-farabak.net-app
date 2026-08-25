import { PlusOutlined } from "@ant-design/icons";
import { Form, Select, InputNumber, Button, FormInstance } from "antd";
import React from "react";

import { adminColors } from "@/constants/adminColors";

import { Product } from "./types";

interface ProductFormValues {
  productId: number;
  quantity: number;
}

interface ProductFormProps {
  form: FormInstance<ProductFormValues>;
  allProducts: Product[];
  onFinish: () => void;
  onSelectProduct: (value: number) => void;
  onQuantityChange: (value: number | null) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  form,
  allProducts,
  onFinish,
  onSelectProduct,
  onQuantityChange,
}) => {
  return (
    <div className="mb-6 rounded-lg bg-gray-800 p-4">
      <h3 className="mb-3 text-lg font-medium text-gray-200">افزودن محصول جدید</h3>
      <Form form={form} layout="vertical" onFinish={onFinish} className="text-gray-100">
        <div className="flex flex-wrap gap-3">
          <Form.Item
            name="productId"
            label={<span className="text-gray-300">محصول</span>}
            className="min-w-[200px] flex-1"
            rules={[{ required: true, message: "لطفاً یک محصول انتخاب کنید" }]}
          >
            <Select
              placeholder="انتخاب محصول"
              onChange={onSelectProduct}
              showSearch
              filterOption={(input, option) =>
                (option?.label?.toString().toLowerCase() ?? "").includes(input.toLowerCase())
              }
              options={allProducts.map((product) => ({
                value: product.ProductId,
                label: product.Type,
              }))}
              className="dark-select text-right"
              popupClassName="dark-dropdown"
            />
          </Form.Item>

          <Form.Item
            name="quantity"
            label={<span className="text-gray-300">تعداد</span>}
            initialValue={1}
            className="w-[120px]"
          >
            <InputNumber
              min={1}
              onChange={(value) => {
                if (value !== null && value >= 1) {
                  onQuantityChange(value);
                }
              }}
              className="dark-input-number w-full text-right"
              style={{
                backgroundColor: adminColors.border,
                borderColor: adminColors.borderLight,
                color: adminColors.textLight,
              }}
            />
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
            className="border-blue-700 bg-blue-600 hover:bg-blue-700"
          >
            افزودن محصول
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProductForm;
