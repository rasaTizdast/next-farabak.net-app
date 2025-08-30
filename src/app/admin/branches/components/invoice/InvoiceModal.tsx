"use client";

import { Modal, Steps, Button, message } from "antd";
import moment from "jalali-moment";
import React, { useState, useEffect } from "react";

import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

import { Branch, Invoice } from "../types";
import CustomerInfoStep from "./steps/CustomerInfoStep";
import ProductSelectionStep from "./steps/ProductSelectionStep";
import ReviewStep from "./steps/ReviewStep";
import WarrantyStep from "./steps/WarrantyStep";

interface InvoiceModalProps {
  visible: boolean;
  onClose: () => void;
  branch: Branch;
  onSuccess?: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ visible, onClose, branch, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [usdToRialRate, setUsdToRialRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [invoice, setInvoice] = useState<Partial<Invoice>>({
    Fullname: "",
    Phonenumber: "",
    UserId: branch?.UserID,
    TotalAmount: 0,
    Checked: true,
    Date: moment().locale("fa").format("YYYY-MM-DDTHH:mm:ss"),
  });
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [productsWithWarranty, setProductsWithWarranty] = useState<any[]>([]);

  // Reset all state when modal becomes visible or is closed
  useEffect(() => {
    if (visible) {
      // Only fetch exchange rate when modal opens
      getExchangeRate();
    } else {
      // Reset form data when modal closes
      resetForm();
    }
  }, [visible, branch?.UserID]);

  const getExchangeRate = async () => {
    const rate = await fetchUsdToRialRate();
    setUsdToRialRate(rate);
  };

  const resetForm = () => {
    setCurrentStep(0);
    setInvoice({
      Fullname: "",
      Phonenumber: "",
      UserId: branch?.UserID,
      TotalAmount: 0,
      Checked: true,
      Date: moment().locale("fa").format("YYYY-MM-DDTHH:mm:ss"),
    });
    setSelectedProducts([]);
    setProductsWithWarranty([]);
  };

  const handleClose = () => {
    onClose();
  };

  const steps = [
    {
      title: "مشخصات خریدار",
      content: (
        <CustomerInfoStep
          invoice={invoice}
          onUpdate={(values) => setInvoice({ ...invoice, ...values })}
        />
      ),
    },
    {
      title: "انتخاب محصولات",
      content: (
        <ProductSelectionStep
          branchId={branch?.branchid}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          usdToRialRate={usdToRialRate}
          onUpdate={(products, totalAmount) => {
            setSelectedProducts(products);
            setInvoice({ ...invoice, TotalAmount: totalAmount });
          }}
        />
      ),
    },
    {
      title: "تنظیم گارانتی",
      content: (
        <WarrantyStep
          selectedProducts={selectedProducts}
          branch={branch}
          productsWithWarranty={productsWithWarranty}
          setProductsWithWarranty={setProductsWithWarranty}
        />
      ),
    },
    {
      title: "بررسی نهایی",
      content: (
        <ReviewStep invoice={invoice as Invoice} productsWithWarranty={productsWithWarranty} />
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep === 0 && (!invoice.Fullname || !invoice.Phonenumber)) {
      message.error("لطفا تمام اطلاعات خریدار را وارد کنید");
      return;
    }

    if (currentStep === 1 && selectedProducts.length === 0) {
      message.error("لطفا حداقل یک محصول انتخاب کنید");
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // With the new approach, each item already has its own warranty
      // Just need to make sure each item has quantity=1
      const individualItems = productsWithWarranty.map((item) => ({
        ProductId: item.ProductId,
        quantity: 1, // Each item has quantity 1
        price: item.price,
        total_price: item.price,
        warranty: item.warranty.hasWarranty
          ? {
              ...item.warranty,
              hasWarranty: true,
            }
          : null,
      }));

      // Prepare data for submission with individual items
      const invoiceData = {
        ...invoice,
        products: individualItems,
      };

      // Submit invoice data
      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          branchId: branch.branchid,
          invoiceData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در ثبت فاکتور");
      }

      message.success("فاکتور با موفقیت ثبت شد");

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        handleClose(); // Only close if onSuccess is not provided
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      message.error("خطا در ثبت فاکتور");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="ایجاد فاکتور جدید"
      open={visible}
      onCancel={handleClose}
      width={1000}
      footer={null}
      maskClosable={true}
      destroyOnClose={true}
      style={{ direction: "rtl" }}
      className="invoice-modal"
      modalRender={(modal) => <div className="overflow-hidden rounded-lg bg-gray-900">{modal}</div>}
    >
      <div className="rounded-lg bg-gray-800 p-4 text-white">
        <Steps current={currentStep} className="custom-dark-steps mb-8">
          {steps.map((step) => (
            <Steps.Step key={step.title} title={step.title} />
          ))}
        </Steps>

        <div className="step-content mb-8">{steps[currentStep].content}</div>

        <div className="mt-4 flex justify-between">
          {currentStep > 0 && (
            <Button
              onClick={handlePrev}
              disabled={isLoading}
              className="border-gray-600 bg-gray-700 text-white hover:border-gray-500 hover:bg-gray-600 hover:text-white"
            >
              قبلی
            </Button>
          )}
          <div className="flex-grow"></div>
          {currentStep < steps.length - 1 ? (
            <Button
              type="primary"
              onClick={handleNext}
              disabled={isLoading}
              className="border-blue-700 bg-blue-600 hover:bg-blue-700"
            >
              بعدی
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              className="border-green-600 bg-green-600 hover:bg-green-700"
            >
              ثبت فاکتور
            </Button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .invoice-modal .ant-modal-content {
          background-color: #1f2937;
          color: white;
        }

        .invoice-modal .ant-modal-header {
          background-color: #1f2937;
          border-bottom: 1px solid #374151;
          color: white;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .invoice-modal .ant-modal-title {
          color: white;
        }

        .invoice-modal .ant-modal-close {
          color: #9ca3af;
        }

        .invoice-modal .ant-modal-close:hover {
          color: white;
        }

        .invoice-modal .ant-steps-item-title {
          color: #9ca3af !important;
        }

        .invoice-modal .ant-steps-item-title:after {
          background-color: #465266 !important;
        }

        .invoice-modal .ant-steps-item-active .ant-steps-item-title {
          color: white !important;
        }

        .invoice-modal .ant-steps-item-finish .ant-steps-item-title {
          color: #60a5fa !important;
        }

        .custom-dark-steps .ant-steps-item-icon {
          background-color: #374151 !important;
          border-color: #4b5563 !important;
        }

        .custom-dark-steps .ant-steps-item-active .ant-steps-item-icon {
          background-color: #2563eb !important;
          border-color: #3b82f6 !important;
        }

        .custom-dark-steps .ant-steps-item-finish .ant-steps-item-icon {
          background-color: #0035c5 !important;
          border-color: #3b82f6 !important;
        }

        /* Ensure the DatePicker appears above the modal */
        .zaman-calendar,
        .zaman-cell,
        .zaman-calendar-popover,
        .zaman-calendar-container {
          z-index: 3000 !important;
        }

        /* Make modals have lower z-index than DatePicker popover */
        .ant-modal {
          z-index: 1000;
        }

        .ant-modal-mask {
          z-index: 1000;
        }

        .ant-modal-wrap {
          z-index: 1000;
        }

        /* Override any other styles that might interfere */
        .ant-picker-dropdown {
          z-index: 3000 !important;
        }

        /* Style for dark tables across all steps */
        .custom-dark-table .ant-table {
          background-color: #111827;
          color: white;
        }

        .custom-dark-table .ant-table-thead > tr > th {
          background-color: #1f2937;
          color: white;
          border-bottom: 1px solid #374151;
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

        /* Fix the tabs styling to match the overall UI */
        .custom-dark-tabs .ant-tabs-nav {
          margin-bottom: 16px;
        }

        .custom-dark-tabs .ant-tabs-tab {
          background-color: #1e293b !important;
          border-color: #334155 !important;
          border-radius: 8px 8px 0 0 !important;
          padding: 8px 16px !important;
          margin-right: 8px !important;
          transition: all 0.2s ease;
          color: #b5bdca;
          opacity: 0.8;
        }

        .custom-dark-tabs .ant-tabs-tab:hover {
          background-color: #263244 !important;
          opacity: 1;
        }

        .custom-dark-tabs .ant-tabs-tab-active {
          background-color: #19202b !important;
          opacity: 1;
        }

        .custom-dark-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
          font-weight: 500;
        }

        .custom-dark-tabs .ant-tabs-content {
          background-color: #19202b;
          padding: 16px;
          border-radius: 0 8px 8px 8px;
        }

        .custom-dark-tabs .ant-tabs-ink-bar {
          display: none;
        }

        .custom-dark-tabs .ant-tabs-nav:before {
          border-bottom: 1px solid #334155;
        }

        .custom-dark-tabs .ant-tabs-nav-list {
          display: flex;
          gap: 4px;
        }

        .custom-dark-tabs .ant-empty-description {
          color: white !important;
        }

        .custom-dark-table .ant-table-container {
          border: 1px solid #374151;
          border-radius: 8px;
          overflow: hidden;
        }
      `}</style>
    </Modal>
  );
};

export default InvoiceModal;
