"use client";

import { Card, Table, Button, Space, Modal, Switch, message, Form, Spin, Input } from "antd";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { DatePicker } from "zaman";

import { useUser } from "@/context/UserContext";
import { useApiMutation } from "@/hooks/useApiMutation";
import { formatDateToISOString, persianToEnglishDigits } from "@/lib/validators";

import { SelectedProduct, ProductWithWarranty } from "./types";
import { Branch } from "../../types";

const persianYearFormatter = new Intl.DateTimeFormat("fa-IR", { year: "numeric" });
const persianMonthFormatter = new Intl.DateTimeFormat("fa-IR", { month: "2-digit" });

// Create a Date object from ISO string
const parseISODate = (dateString: string | null): Date | null => {
  if (!dateString) return null;
  // Create date with Tehran timezone
  const date = new Date(dateString);
  return date;
};

function calculateDuration(startDate: Date | string | null, endDate: Date | string | null) {
  if (!startDate || !endDate) return null;

  try {
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
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
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;

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
}

interface WarrantyStepProps {
  selectedProducts: SelectedProduct[];
  branch: Branch;
  productsWithWarranty: ProductWithWarranty[];
  setProductsWithWarranty: React.Dispatch<React.SetStateAction<ProductWithWarranty[]>>;
}

async function doUpdateWarranties(
  selectedProducts: SelectedProduct[],
  isGeneratingCodes: boolean,
  branch: Branch,
  productsWithWarranty: ProductWithWarranty[],
  setProductsWithWarranty: React.Dispatch<React.SetStateAction<ProductWithWarranty[]>>,
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

    const persianYear = persianYearFormatter.format(date);
    const yearStr = persianToEnglishDigits(persianYear);
    const yearNum = yearStr.slice(-3);

    const persianMonth = persianMonthFormatter.format(date);
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
      const existingCodes = items.flatMap((item) =>
        item.warranty?.warrantycode ? [item.warranty.warrantycode] : []
      );
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

    const expandedItems: ProductWithWarranty[] = [];
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
  const editingProductRef = useRef<ProductWithWarranty | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [durationText, setDurationText] = useState<string | null>(null);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [isDatePickerLoading, setIsDatePickerLoading] = useState(false);
  const [todayTimestamp] = useState(() => Date.now());

  const { mutate: generateBatchMutate } = useApiMutation<
    { branchCode: string; yearMonth: string; count: number },
    { warrantyCodes: string[] }
  >("post");

  // Generate warranty codes in a batch to reduce API calls
  const generateBatchWarrantyCodes = useCallback(
    async (branchCode: string, yearMonth: string, count: number): Promise<string[]> => {
      const data = await generateBatchMutate("/api/admin/warranty/generate-batch", {
        branchCode,
        yearMonth,
        count,
      });

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
    },
    [generateBatchMutate]
  );

  // Only generate codes for products that do not already have warranty data from API
  // Trigger warranty update when products change (one-time effect)
  useEffect(() => {
    if (selectedProducts.length > 0 && !isGeneratingCodes) {
      doUpdateWarranties(
        selectedProducts,
        isGeneratingCodes,
        branch,
        productsWithWarranty,
        setProductsWithWarranty,
        setIsGeneratingCodes,
        generateBatchWarrantyCodes
      );
    }
  }, [
    selectedProducts,
    isGeneratingCodes,
    branch,
    productsWithWarranty,
    generateBatchWarrantyCodes,
    setProductsWithWarranty,
  ]);

  const handleEdit = (item: ProductWithWarranty) => {
    editingProductRef.current = item;
    setIsDatePickerLoading(true);

    // Set default values based on the item's warranty
    const hasWarranty = item.warranty?.hasWarranty !== false;
    let startDate: string = item.warranty?.startdate || "";
    let expiryDate: string = item.warranty?.expirydate || "";

    // If no dates are set or creating new warranty, set defaults
    if (!startDate || !expiryDate) {
      const today = new Date();
      startDate = formatDateToISOString(today) || "";

      // Default end date (1 year)
      const oneYearLater = new Date(today);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      // Ensure we keep the same day of month
      oneYearLater.setDate(today.getDate());
      expiryDate = formatDateToISOString(oneYearLater) || "";
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
        const currentEditing = editingProductRef.current;
        if (!currentEditing) return;

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
        if (isBranch && currentEditing.warranty?.startdate) {
          startdate = currentEditing.warranty.startdate;
        }

        // Find the item in the current list and update it
        const updatedItems = productsWithWarranty.map((item) => {
          if (item.singleItemId === currentEditing.singleItemId) {
            return {
              ...item,
              warranty: {
                ...item.warranty,
                startdate,
                expirydate,
                warrantycode: currentEditing.warranty?.warrantycode, // Always preserve the original code
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
        isBranch && editingProductRef.current?.warranty?.startdate
          ? parseISODate(editingProductRef.current.warranty.startdate)
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
      render: (text: string, record: ProductWithWarranty) => {
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
      render: (_: unknown, record: ProductWithWarranty) => {
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
      render: (_: unknown, record: ProductWithWarranty) => {
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
      render: (_: unknown, record: ProductWithWarranty) => (
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
          className="custom-dark-table [&_.ant-table]:bg-gray-900! [&_.ant-table]:text-white! [&_.ant-table-tbody>tr:hover>td]:bg-[#2d3748]! [&_.ant-table-tbody>tr>td]:border-b-gray-700! [&_.ant-table-tbody>tr>td]:text-white! [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-2 [&_.ant-table-thead>tr>th]:border-b-gray-700! [&_.ant-table-thead>tr>th]:bg-gray-800! [&_.ant-table-thead>tr>th]:text-white!"
          rowClassName={(record) => {
            // Find all items with same product ID
            const sameProductItems = productsWithWarranty.filter(
              (item) => item.ProductId === record.ProductId
            );

            // Find index of current item
            const currentIndex = sameProductItems.findIndex(
              (item) => item.singleItemId === record.singleItemId
            );

            // Zebra backgrounds for group rows
            let className = "odd:!bg-gray-900 even:!bg-[#1a202c]";

            // First item of a group
            if (currentIndex === 0) {
              className += " [&>td]:!border-b-0 [&>td]:!pb-2 [&>td:first-child]:rounded-tl-[3px]";
            }
            // Last item of a group
            else if (currentIndex === sameProductItems.length - 1) {
              className += " [&>td]:!border-t-0 [&>td]:!pt-2 [&>td:first-child]:rounded-bl-[3px]";
            }
            // Middle items
            else {
              className += " [&>td]:!border-y-0 [&>td]:!py-2";
            }

            // Add product-specific color class
            const colorIndex = getProductColorIndex(record.ProductId);
            className += ` ${getProductRowBorderClass(getColorNameByIndex(colorIndex))}`;

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
        className="warranty-modal [&_.ant-modal-header]:mb-5! [&_.ant-modal-header]:pb-2.5!"
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
            className="warranty-form [&_.ant-form-item]:mb-6! [&_.ant-form-item-label>label]:text-gray-200!"
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
                        className="w-full rounded-lg bg-gray-700 p-2 text-gray-300! outline-none focus:ring-2 focus:ring-blue-500"
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
                                className="ml-1 size-3"
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
                          defaultValue={
                            form.getFieldValue("startdate") ||
                            (todayTimestamp ? new Date(todayTimestamp) : undefined)
                          }
                          weekends={[5, 6]}
                          round="x2"
                          accentColor="#226bff"
                          inputClass={`w-full p-2 ${
                            isBranch ? "bg-gray-800 opacity-70" : "bg-gray-700"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white`}
                          className="z-1000"
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
                          (todayTimestamp
                            ? (() => {
                                const date = new Date(todayTimestamp);
                                date.setFullYear(date.getFullYear() + 1);
                                return date;
                              })()
                            : undefined)
                        }
                        weekends={[5, 6]}
                        round="x3"
                        accentColor="#226bff"
                        inputClass="w-full p-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                        className="z-1000"
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
                className={`my-4 rounded p-2 text-center ${
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

// Color utilities mapped from the color name
const colorClassMap: Record<string, { badge: string; rowBorder: string }> = {
  blue: {
    badge: "!bg-blue-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-blue-500",
  },
  green: {
    badge: "!bg-emerald-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-emerald-500",
  },
  purple: {
    badge: "!bg-violet-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-violet-500",
  },
  orange: {
    badge: "!bg-amber-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-amber-500",
  },
  pink: {
    badge: "!bg-pink-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-pink-500",
  },
  cyan: {
    badge: "!bg-cyan-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-cyan-500",
  },
  red: {
    badge: "!bg-red-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-red-500",
  },
  lime: {
    badge: "!bg-lime-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-lime-500",
  },
};

// Function to deterministically assign a color class based on product ID
const getProductColor = (productId: string | number): string => {
  const colorIndex = getProductColorIndex(productId);
  return colorClassMap[getColorNameByIndex(colorIndex)].badge;
};

// Function to get the row border class for a color name
const getProductRowBorderClass = (colorName: string): string => colorClassMap[colorName].rowBorder;

// Get color name by index
const getColorNameByIndex = (index: number): string => {
  const colorNames = ["blue", "green", "purple", "orange", "pink", "cyan", "red", "lime"];

  return colorNames[index];
};

export default WarrantyStep;
