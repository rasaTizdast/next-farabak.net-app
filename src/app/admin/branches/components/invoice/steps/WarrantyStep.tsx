"use client";

import { Card, Table, Button, Space, Modal, Switch, message, Form, Spin, Input } from "antd";
import React, { useState, useEffect, useCallback } from "react";
import { DatePicker } from "zaman";

import { useUser } from "@/context/UserContext";
import { useApiMutation } from "@/hooks/useApiMutation";

import { Branch } from "../../types";

// Format a Date object to YYYY-MM-DD string
const formatDateToISOString = (date: Date | null): string | null => {
  if (!date) return null;
  // Use a fixed timezone (Tehran) for consistency
  const tehranDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Tehran" }));
  return tehranDate.toISOString().split("T")[0];
};

// Create a Date object from ISO string
const parseISODate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  // Create date with Tehran timezone
  const date = new Date(dateString);
  return date;
};

// Parse Persian digits to English digits
const persianToEnglishDigits = (str: string): string => {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode >= 1776 && charCode <= 1785) {
      // Persian digits range
      result += String.fromCharCode(charCode - 1728); // Convert to English digits
    } else {
      result += str.charAt(i);
    }
  }
  return result;
};

// Define props interface for DatePicker to resolve type issues
interface WarrantyStepProps {
  selectedProducts: any[];
  branch: Branch;
  productsWithWarranty: any[];
  setProductsWithWarranty: React.Dispatch<React.SetStateAction<any[]>>;
}

async function doUpdateWarranties(
  selectedProducts: any[],
  isGeneratingCodes: boolean,
  branch: any,
  productsWithWarranty: any[],
  setProductsWithWarranty: React.Dispatch<React.SetStateAction<any[]>>,
  setIsGeneratingCodes: React.Dispatch<React.SetStateAction<boolean>>,
  generateBatchWarrantyCodes: (
    branchCode: string,
    yearMonth: string,
    count: number
  ) => Promise<string[]>
) {
  if (selectedProducts.length === 0 || isGeneratingCodes) return;

  let allHaveWarranty = true;
  for (const product of selectedProducts) {
    const items = productsWithWarranty.filter((p) => p.ProductId === product.ProductId);
    if (items.length < product.quantity) {
      allHaveWarranty = false;
      break;
    }
  }
  if (allHaveWarranty && productsWithWarranty.length > 0) {
    return;
  }

  try {
    setIsGeneratingCodes(true);

    const branchCode = branch.location || "HQ";
    const date = new Date();

    const persianYear = new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
    }).format(date);
    const yearStr = persianToEnglishDigits(persianYear);
    const yearNum = yearStr.slice(-3);

    const persianMonth = new Intl.DateTimeFormat("fa-IR", {
      month: "2-digit",
    }).format(date);
    const monthNum = persianToEnglishDigits(persianMonth);
    const yearMonth = yearNum + monthNum.padStart(2, "0");

    const currentDate = new Date();
    const startDate = currentDate.toISOString().split("T")[0];
    const oneYearLater = new Date(currentDate);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    oneYearLater.setDate(currentDate.getDate());
    const endDate = oneYearLater.toISOString().split("T")[0];

    let totalCodesNeeded = 0;
    const productCodeNeeds: {
      productId: number;
      existingCodes: string[];
      codesNeeded: number;
    }[] = [];

    for (const product of selectedProducts) {
      const items = productsWithWarranty.filter((p) => p.ProductId === product.ProductId);
      const existingCodes = items.map((item) => item.warranty?.warrantycode).filter(Boolean);
      const codesNeeded = Math.max(0, product.quantity - existingCodes.length);
      totalCodesNeeded += codesNeeded;
      productCodeNeeds.push({
        productId: product.ProductId,
        existingCodes,
        codesNeeded,
      });
    }

    let allNewCodes: string[] = [];
    if (totalCodesNeeded > 0) {
      allNewCodes = await generateBatchWarrantyCodes(branchCode, yearMonth, totalCodesNeeded);
    }

    const expandedItems: any[] = [];
    let usedCodesCount = 0;

    for (let i = 0; i < productCodeNeeds.length; i++) {
      const product = selectedProducts[i];
      const { existingCodes, codesNeeded } = productCodeNeeds[i];

      const productNewCodes = allNewCodes.slice(usedCodesCount, usedCodesCount + codesNeeded);
      usedCodesCount += codesNeeded;

      let warrantyCodes = [...existingCodes];
      if (codesNeeded > 0) {
        warrantyCodes = [...warrantyCodes, ...productNewCodes];
      } else if (product.quantity < existingCodes.length) {
        warrantyCodes = warrantyCodes.slice(0, product.quantity);
      }

      const items = productsWithWarranty.filter((p) => p.ProductId === product.ProductId);

      for (let j = 0; j < product.quantity; j++) {
        const existingItem = items[j];
        expandedItems.push({
          ...product,
          itemIndex: j,
          itemNumber: j + 1,
          singleItemId: `${product.ProductId}-${j}`,
          warranty: existingItem?.warranty
            ? { ...existingItem.warranty, warrantycode: warrantyCodes[j] || "" }
            : {
                ProductId: product.ProductId,
                startdate: startDate,
                expirydate: endDate,
                warrantycode: warrantyCodes[j] || "",
                hasWarranty: true,
              },
        });
      }
    }

    setProductsWithWarranty(expandedItems);
  } catch (error) {
    console.error("Error updating warranty codes:", error);
    message.error("خطا در به‌روزرسانی کدهای گارانتی");
  } finally {
    setIsGeneratingCodes(false);
  }
}

const WarrantyStep: React.FC<WarrantyStepProps> = ({
  selectedProducts,
  branch,
  productsWithWarranty,
  setProductsWithWarranty,
}) => {
  const { isBranch } = useUser();
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [durationText, setDurationText] = useState<string | null>(null);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [isDatePickerLoading, setIsDatePickerLoading] = useState(false);

  const { mutate: generateBatchMutate } = useApiMutation<{ warrantyCodes: string[] }>("post");

  // Generate warranty codes in a batch to reduce API calls
  const generateBatchWarrantyCodes = async (
    branchCode: string,
    yearMonth: string,
    count: number
  ): Promise<string[]> => {
    const data = await generateBatchMutate(
      "/api/admin/warranty/generate-batch",
      { branchCode, yearMonth, count }
    );

    if (data && data.warrantyCodes) {
      return data.warrantyCodes;
    }

    console.error("Error generating batch warranty codes");
    // Fallback to local generation if API fails
    return Array(count)
      .fill(null)
      .map(() => {
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${branchCode}-${yearMonth}-${randomCode}`;
      });
  };

  // Only generate codes for products that do not already have warranty data from API
  const updateWarranties = useCallback(async () => {
    await doUpdateWarranties(
      selectedProducts,
      isGeneratingCodes,
      branch,
      productsWithWarranty,
      setProductsWithWarranty,
      setIsGeneratingCodes,
      generateBatchWarrantyCodes
    );
  }, [selectedProducts, isGeneratingCodes, branch, productsWithWarranty, setProductsWithWarranty]);

  // Use effect to trigger warranty update when products change
  useEffect(() => {
    if (selectedProducts.length > 0 && !isGeneratingCodes) {
      updateWarranties();
    }
  }, [selectedProducts, isGeneratingCodes, updateWarranties]);

  const handleEdit = (item: any) => {
    setEditingProduct(item);
    setIsDatePickerLoading(true);

    // Set default values based on the item's warranty
    const hasWarranty = item.warranty?.hasWarranty !== false;
    let startDate = item.warranty?.startdate;
    let expiryDate = item.warranty?.expirydate;

    // If no dates are set or creating new warranty, set defaults
    if (!startDate || !expiryDate) {
      const today = new Date();
      startDate = formatDateToISOString(today);

      // Default end date (1 year)
      const oneYearLater = new Date(today);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      // Ensure we keep the same day of month
      oneYearLater.setDate(today.getDate());
      expiryDate = formatDateToISOString(oneYearLater);
    }

    // For the form, use the Date objects - Zaman requires Date objects for defaultValue
    form.setFieldsValue({
      hasWarranty,
      startdate: hasWarranty ? parseISODate(startDate) : null,
      expirydate: hasWarranty ? parseISODate(expiryDate) : null,
      warrantycode: item.warranty?.warrantycode || "",
    });

    // Calculate duration if both dates are present
    if (hasWarranty && startDate && expiryDate) {
      const startDateObj = parseISODate(startDate);
      const expiryDateObj = parseISODate(expiryDate);
      const duration = calculateDuration(startDateObj, expiryDateObj);
      setDurationText(duration);
    } else {
      setDurationText(null);
    }

    setModalVisible(true);

    // Small delay to ensure DatePicker renders properly
    setTimeout(() => {
      setIsDatePickerLoading(false);
    }, 300);
  };

  const handleSaveWarranty = () => {
    form
      .validateFields()
      .then((values) => {
        if (!editingProduct) return;

        // Extract form values
        const { hasWarranty } = values;

        // Get the dates from the form values
        let startdate = values.startdate;
        let expirydate = values.expirydate;

        // Process the start date - Zaman DatePicker returns an object with a value property
        if (startdate && typeof startdate === "object") {
          if ("value" in startdate) {
            startdate = formatDateToISOString(new Date(startdate.value));
          } else if (startdate instanceof Date) {
            startdate = formatDateToISOString(startdate);
          }
        }

        // Process the expiry date similarly
        if (expirydate && typeof expirydate === "object") {
          if ("value" in expirydate) {
            expirydate = formatDateToISOString(new Date(expirydate.value));
          } else if (expirydate instanceof Date) {
            expirydate = formatDateToISOString(expirydate);
          }
        }

        // For branch users, preserve the original start date
        if (isBranch && editingProduct.warranty?.startdate) {
          startdate = editingProduct.warranty.startdate;
        }

        // Find the item in the current list and update it
        const updatedItems = productsWithWarranty.map((item) => {
          if (item.singleItemId === editingProduct.singleItemId) {
            return {
              ...item,
              warranty: {
                ...item.warranty,
                startdate,
                expirydate,
                warrantycode: editingProduct.warranty?.warrantycode, // Always preserve the original code
                hasWarranty,
              },
            };
          }
          return item;
        });

        setProductsWithWarranty(updatedItems);
        setModalVisible(false);
        message.success("اطلاعات گارانتی با موفقیت ذخیره شد");
      })
      .catch((err) => {
        console.error("Form validation error:", err);
        message.error("لطفا فرم را به درستی تکمیل کنید");
      });
  };

  const calculateDuration = (startDate: Date | string | null, endDate: Date | string | null) => {
    if (!startDate || !endDate) return null;

    try {
      // Convert to Date objects if they are strings
      const start = startDate instanceof Date ? startDate : new Date(startDate);
      const end = endDate instanceof Date ? endDate : new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error("Invalid date in calculateDuration:", {
          start,
          end,
          startTime: start.getTime(),
          endTime: end.getTime(),
        });
        return "تاریخ نامعتبر";
      }

      if (start >= end) return "تاریخ پایان باید پس از تاریخ شروع باشد";

      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const totalMonths = Math.floor(diffDays / 30);

      if (diffDays < 30) {
        return `${diffDays} روز`;
      } else if (totalMonths < 12) {
        return `${totalMonths} ماه`;
      } else {
        // First calculate exact years and months for more accuracy
        const years = Math.floor(totalMonths / 12);
        const remainingMonths = totalMonths % 12;

        // Special case: if months is exactly a multiple of 12, show just years
        if (remainingMonths === 0) {
          return `${years} سال`;
        } else {
          return `${years} سال و ${remainingMonths} ماه`;
        }
      }
    } catch (error) {
      console.error("Error calculating duration:", error);
      return "خطا در محاسبه مدت گارانتی";
    }
  };

  const handleDateChange = () => {
    try {
      const hasWarranty = form.getFieldValue("hasWarranty");
      let startDate = form.getFieldValue("startdate");
      let endDate = form.getFieldValue("expirydate");

      // Process the start date - Zaman DatePicker returns an object with a value property
      if (startDate && typeof startDate === "object" && "value" in startDate) {
        startDate = new Date(startDate.value);
      }

      // Process the expiry date similarly
      if (endDate && typeof endDate === "object" && "value" in endDate) {
        endDate = new Date(endDate.value);
      }

      if (hasWarranty && startDate && endDate) {
        const duration = calculateDuration(startDate, endDate);
        setDurationText(duration);
      } else {
        setDurationText(null);
      }
    } catch (error) {
      console.error("Error in date change:", error);
      setDurationText("خطا در محاسبه مدت گارانتی");
    }
  };

  const handleWarrantyToggle = (checked: boolean) => {
    // When toggling warranty on/off, update form fields accordingly
    if (checked) {
      // Set default dates if warranty is enabled
      const today = new Date();

      // Default end date (1 year)
      const oneYearLater = new Date(today);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      // Ensure we keep the same day of month
      oneYearLater.setDate(today.getDate());

      // For branch users, keep the original start date if editing an existing product
      const startDate =
        isBranch && editingProduct?.warranty?.startdate
          ? parseISODate(editingProduct.warranty.startdate)
          : today;

      // For Zaman DatePicker, use Date objects directly
      form.setFieldsValue({
        startdate: startDate,
        expirydate: oneYearLater,
      });

      // Calculate duration
      const duration = calculateDuration(startDate, oneYearLater);
      setDurationText(duration);
    } else {
      // Clear date fields if warranty is disabled
      form.setFieldsValue({
        startdate: null,
        expirydate: null,
      });
      setDurationText(null);
    }
  };

  const columns = [
    {
      title: "نام محصول",
      dataIndex: "Name",
      key: "name",
      render: (text: any, record: any) => {
        // Find all items with the same product ID
        const sameProductItems = productsWithWarranty.filter(
          (item) => item.ProductId === record.ProductId
        );

        // Only show product name for the first occurrence
        const isFirstOccurrence =
          sameProductItems.findIndex((item) => item.singleItemId === record.singleItemId) === 0;

        if (isFirstOccurrence) {
          // Get color based on ProductId
          const colorClass = getProductColor(record.ProductId);

          return (
            <div className="flex items-start gap-2">
              <span>{text}</span>
              <span className={`${colorClass} rounded-full px-2 py-0.5 text-xs text-white`}>
                {sameProductItems.length}×
              </span>
            </div>
          );
        }
        return null;
      },
    },
    {
      title: "کد گارانتی",
      key: "warrantyCode",
      render: (_, record) => {
        // Find all items with same product ID
        const sameProductItems = productsWithWarranty.filter(
          (item) => item.ProductId === record.ProductId
        );

        // Find index of current item
        const currentIndex = sameProductItems.findIndex(
          (item) => item.singleItemId === record.singleItemId
        );

        // Generate item indicator
        const itemIndicator =
          sameProductItems.length > 1
            ? `محصول ${currentIndex + 1} از ${sameProductItems.length}: `
            : "";

        return record.warranty?.hasWarranty !== false ? (
          <div className="flex flex-col">
            <span>
              {itemIndicator}
              {record.warranty?.warrantycode || "بدون کد"}
            </span>
          </div>
        ) : (
          "بدون گارانتی"
        );
      },
    },
    {
      title: "مدت گارانتی",
      key: "warrantyDuration",
      render: (_, record) => {
        if (record.warranty?.hasWarranty === false) return "بدون گارانتی";
        if (!record.warranty?.startdate || !record.warranty?.expirydate) return "-";

        const startDate = record.warranty.startdate;
        const expiryDate = record.warranty.expirydate;

        return calculateDuration(startDate, expiryDate);
      },
    },
    {
      title: "عملیات",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button htmlType="button" type="primary" size="small" onClick={() => handleEdit(record)}>
            تنظیم گارانتی
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card className="border-0 bg-gray-900 shadow-md">
      <h3 className="mb-4 text-lg font-medium text-white">تنظیم گارانتی برای محصولات</h3>

      {isGeneratingCodes ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-white">در حال ایجاد کدهای گارانتی برای محصولات...</div>
        </div>
      ) : (
        <Table
          dataSource={productsWithWarranty}
          columns={columns}
          rowKey="singleItemId"
          pagination={false}
          className="custom-dark-table"
          rowClassName={(record) => {
            // Find all items with same product ID
            const sameProductItems = productsWithWarranty.filter(
              (item) => item.ProductId === record.ProductId
            );

            // Find index of current item
            const currentIndex = sameProductItems.findIndex(
              (item) => item.singleItemId === record.singleItemId
            );

            // Add a class based on position
            let className = "dark-table-row";

            // First item of a group
            if (currentIndex === 0) {
              className += " first-group-item";
            }
            // Last item of a group
            else if (currentIndex === sameProductItems.length - 1) {
              className += " last-group-item";
            }
            // Middle items
            else {
              className += " middle-group-item";
            }

            // Add product-specific color class
            const colorIndex = getProductColorIndex(record.ProductId);
            className += ` product-color-${getColorNameByIndex(colorIndex)}`;

            return className;
          }}
        />
      )}

      <Modal
        title="تنظیم گارانتی"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSaveWarranty}
        okText="ذخیره"
        cancelText="انصراف"
        className="warranty-modal"
        zIndex={1000}
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
              // Call date change handler only when date fields change
              if (changedValues.startdate || changedValues.expirydate) {
                handleDateChange();
              }
              // Call warranty toggle handler when hasWarranty changes
              if ("hasWarranty" in changedValues) {
                handleWarrantyToggle(changedValues.hasWarranty);
              }
            }}
            className="warranty-form"
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
                          defaultValue={form.getFieldValue("startdate") || new Date()}
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
                            // Only update if not branch (extra safeguard)
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
                        defaultValue={
                          form.getFieldValue("expirydate") ||
                          (() => {
                            const date = new Date();
                            date.setFullYear(date.getFullYear() + 1);
                            return date;
                          })()
                        }
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
                className={`mb-4 mt-4 rounded p-2 text-center ${
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

      <style jsx global>{`
        .custom-dark-table .ant-table {
          background-color: #111827;
          color: white;
        }

        .custom-dark-table .ant-table-thead > tr > th {
          background-color: #1f2937;
          color: white;
          border-bottom: 1px solid #374151;
          position: sticky;
          top: 0;
          z-index: 2;
        }

        .custom-dark-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #374151;
          color: white;
        }

        .custom-dark-table .ant-table-tbody > tr.dark-table-row:hover > td {
          background-color: #2d3748;
        }

        .dark-table-row {
          background-color: #111827;
        }

        /* Clean group styling */
        .first-group-item td {
          border-bottom-width: 0 !important;
          padding-bottom: 8px !important;
        }

        .middle-group-item td {
          border-top-width: 0 !important;
          border-bottom-width: 0 !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }

        .last-group-item td {
          border-top-width: 0 !important;
          padding-top: 8px !important;
        }

        /* Group row backgrounds */
        .dark-table-row:nth-child(odd) {
          background-color: #111827 !important;
        }

        .dark-table-row:nth-child(even) {
          background-color: #1a202c !important;
        }

        /* Product color indicators */
        .product-color-blue td:first-child {
          border-left: 3px solid #3b82f6 !important;
        }

        .product-color-green td:first-child {
          border-left: 3px solid #10b981 !important;
        }

        .product-color-purple td:first-child {
          border-left: 3px solid #8b5cf6 !important;
        }

        .product-color-orange td:first-child {
          border-left: 3px solid #f59e0b !important;
        }

        .product-color-pink td:first-child {
          border-left: 3px solid #ec4899 !important;
        }

        .product-color-cyan td:first-child {
          border-left: 3px solid #06b6d4 !important;
        }

        .product-color-red td:first-child {
          border-left: 3px solid #ef4444 !important;
        }

        .product-color-lime td:first-child {
          border-left: 3px solid #84cc16 !important;
        }

        /* Badge colors for quantity */
        .bg-color-blue {
          background-color: #3b82f6 !important;
        }

        .bg-color-green {
          background-color: #10b981 !important;
        }

        .bg-color-purple {
          background-color: #8b5cf6 !important;
        }

        .bg-color-orange {
          background-color: #f59e0b !important;
        }

        .bg-color-pink {
          background-color: #ec4899 !important;
        }

        .bg-color-cyan {
          background-color: #06b6d4 !important;
        }

        .bg-color-red {
          background-color: #ef4444 !important;
        }

        .bg-color-lime {
          background-color: #84cc16 !important;
        }

        /* Round corners for first and last items */
        .first-group-item td:first-child {
          border-top-left-radius: 3px;
        }

        .last-group-item td:first-child {
          border-bottom-left-radius: 3px;
        }

        .warranty-modal .ant-modal-content {
          background-color: #1f2937;
          color: white;
        }

        .warranty-modal .ant-modal-header {
          background-color: #1f2937;
          border-bottom: 1px solid #374151;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .warranty-modal .ant-modal-title {
          color: white;
        }

        /* Style form elements */
        .warranty-form .ant-form-item-label > label {
          color: #e5e7eb;
        }

        .warranty-form .ant-form-item {
          margin-bottom: 24px;
        }

        /* Make modals have lower z-index than DatePicker popover */
        .ant-modal-mask,
        .ant-modal-wrap {
          z-index: 1000;
        }

        /* Override any other styles that might interfere */
        .ant-picker-dropdown {
          z-index: 3000 !important;
        }
      `}</style>
    </Card>
  );
};

// Function to get color index for product ID
const getProductColorIndex = (productId: string | number): number => {
  // Ensure productId is a string
  const productIdStr = String(productId);

  // Extract numbers from the productId if possible
  const numbers = productIdStr.match(/\d+/g);
  let numValue = 0;

  if (numbers && numbers.length > 0) {
    // Use the first number found in the ID
    numValue = parseInt(numbers[0], 10);
  } else {
    // If no numbers, use the sum of char codes
    numValue = productIdStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  // Return color index (0-7)
  return numValue % 8;
};

// Function to deterministically assign a color class based on product ID
const getProductColor = (productId: string | number): string => {
  const colorIndex = getProductColorIndex(productId);
  return `bg-color-${getColorNameByIndex(colorIndex)}`;
};

// Get color name by index
const getColorNameByIndex = (index: number): string => {
  const colorNames = ["blue", "green", "purple", "orange", "pink", "cyan", "red", "lime"];

  return colorNames[index];
};

export default WarrantyStep;
