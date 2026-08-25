"use client";

import { Modal, Form, Switch, Input, Spin } from "antd";
import React, { useState } from "react";
import { DatePicker } from "zaman";

import { useWarrantyForm } from "../hooks/useWarrantyForm";
import { useWarrantyStep } from "../WarrantyStepContext";

export function WarrantyFormModal() {
  const { state } = useWarrantyStep();
  const [form] = Form.useForm();

  const [defaultStartDate] = useState(() => new Date());
  const [defaultExpiryDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
  });

  const {
    handleEdit,
    handleSaveWarranty,
    handleDateChange,
    handleWarrantyToggle,
    editingProduct,
    modalVisible,
    setModalVisible,
    isDatePickerLoading,
    durationText,
    isBranch,
  } = useWarrantyForm(form);

  // Sync editingProduct from context
  React.useEffect(() => {
    if (state.editingProduct && state.editingProduct !== editingProduct) {
      handleEdit(state.editingProduct);
    }
  }, [state.editingProduct, handleEdit, editingProduct]);

  return (
    <Modal
      title="تنظیم گارانتی"
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      onOk={handleSaveWarranty}
      okText="ذخیره"
      cancelText="انصراف"
      className="warranty-modal [&_.ant-modal-header]:!mb-5 [&_.ant-modal-header]:!pb-2.5"
      zIndex={1000}
      width={500}
    >
      {isDatePickerLoading ? (
        <div className="my-10 flex justify-center">
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues) => {
            if (changedValues.startdate || changedValues.expirydate) {
              handleDateChange();
            }
            if ("hasWarranty" in changedValues) {
              handleWarrantyToggle(changedValues.hasWarranty);
            }
          }}
          className="warranty-form [&_.ant-form-item]:!mb-6 [&_.ant-form-item-label>label]:!text-gray-200"
        >
          <Form.Item
            name="hasWarranty"
            label={<span className="text-white">فعال کردن گارانتی</span>}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.hasWarranty !== currentValues.hasWarranty
            }
          >
            {({ getFieldValue }) => {
              const hasWarranty = getFieldValue("hasWarranty");
              return (
                <div className={hasWarranty ? "opacity-100" : "pointer-events-none opacity-50"}>
                  <Form.Item
                    name="warrantycode"
                    label={<span className="text-white">کد گارانتی</span>}
                  >
                    <Input
                      className="w-full rounded-lg bg-gray-700 p-2 !text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="کد گارانتی"
                      readOnly
                      disabled
                    />
                  </Form.Item>

                  <Form.Item
                    name="startdate"
                    label={
                      <span className="text-white">
                        تاریخ شروع گارانتی
                        {isBranch && (
                          <span className="mr-2 inline-flex items-center rounded-full border border-blue-700 bg-blue-900 px-2 py-0.5 text-xs text-blue-200">
                            <svg
                              className="ml-1 h-3 w-3"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                            غیرقابل تغییر
                          </span>
                        )}
                      </span>
                    }
                    rules={
                      hasWarranty
                        ? [
                            {
                              required: true,
                              message: "لطفا تاریخ شروع گارانتی را وارد کنید",
                            },
                          ]
                        : undefined
                    }
                  >
                    <div className={isBranch ? "pointer-events-none" : ""}>
                      <DatePicker
                        defaultValue={form.getFieldValue("startdate") || defaultStartDate}
                        weekends={[5, 6]}
                        round="x2"
                        accentColor="#226bff"
                        inputClass={`w-full p-2 ${
                          isBranch ? "bg-gray-800 opacity-70" : "bg-gray-700"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white`}
                        className="z-[1000]"
                        direction="rtl"
                        position="left"
                        onChange={(value) => {
                          if (!isBranch) {
                            form.setFieldsValue({ startdate: value });
                            handleDateChange();
                          }
                        }}
                      />
                    </div>
                  </Form.Item>

                  <Form.Item
                    name="expirydate"
                    label={<span className="text-white">تاریخ پایان گارانتی</span>}
                    rules={
                      hasWarranty
                        ? [
                            {
                              required: true,
                              message: "لطفا تاریخ پایان گارانتی را وارد کنید",
                            },
                          ]
                        : undefined
                    }
                  >
                    <DatePicker
                      defaultValue={form.getFieldValue("expirydate") || defaultExpiryDate}
                      weekends={[5, 6]}
                      round="x3"
                      accentColor="#226bff"
                      inputClass="w-full p-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                      className="z-[1000]"
                      direction="rtl"
                      position="left"
                      onChange={(value) => {
                        form.setFieldsValue({ expirydate: value });
                        handleDateChange();
                      }}
                    />
                  </Form.Item>
                </div>
              );
            }}
          </Form.Item>

          {durationText && (
            <div
              className={`mt-4 mb-4 rounded p-2 text-center ${
                durationText.includes("باید") || durationText.includes("خطا")
                  ? "bg-red-900 text-red-200"
                  : "bg-blue-900 text-blue-200"
              }`}
            >
              <p>مدت گارانتی: {durationText}</p>
            </div>
          )}
        </Form>
      )}
    </Modal>
  );
}
