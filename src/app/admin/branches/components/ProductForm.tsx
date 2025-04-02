import React from 'react';
import { Form, Select, InputNumber, Button } from 'antd';
import { PlusOutlined } from "@ant-design/icons";
import { Product } from './types';

interface ProductFormProps {
  form: any;
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
  onQuantityChange
}) => {
  return (
    <div className="mb-6 bg-gray-800 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-3 text-gray-200">
        افزودن محصول جدید
      </h3>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="text-gray-100"
      >
        <div className="flex flex-wrap gap-3">
          <Form.Item
            name="productId"
            label={<span className="text-gray-300">محصول</span>}
            className="flex-1 min-w-[200px]"
            rules={[
              { required: true, message: "لطفاً یک محصول انتخاب کنید" },
            ]}
          >
            <Select
              placeholder="انتخاب محصول"
              onChange={onSelectProduct}
              showSearch
              filterOption={(input, option) =>
                (option?.label?.toString().toLowerCase() ?? "").includes(
                  input.toLowerCase()
                )
              }
              options={allProducts.map((product) => ({
                value: product.ProductId,
                label: product.Type,
              }))}
              className="text-right dark-select"
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
              onChange={onQuantityChange}
              className="w-full text-right dark-input-number"
              style={{
                backgroundColor: "#374151",
                borderColor: "#4b5563",
                color: "#e5e7eb",
              }}
            />
          </Form.Item>
        </div>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            icon={<PlusOutlined />}
            className="bg-blue-600 hover:bg-blue-700 border-blue-700"
          >
            افزودن محصول
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ProductForm; 