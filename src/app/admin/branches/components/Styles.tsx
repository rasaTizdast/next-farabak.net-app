import React from "react";

const Styles: React.FC = () => {
  return (
    <style jsx global>{`
      /* Modal and drawer text and close button styling */
      .rtl-modal .ant-modal-header,
      .rtl-modal .ant-modal-title,
      .rtl-modal .ant-modal-body,
      .rtl-drawer .ant-drawer-header-title,
      .rtl-drawer .ant-drawer-title {
        text-align: right;
        direction: rtl;
        color: #f3f4f6 !important;
        margin-bottom: 10px;
      }

      /* Override ant design modal title styling */
      .ant-modal-title {
        color: #f3f4f6 !important;
      }

      /* Brighten close button */
      .ant-modal-close,
      .ant-drawer-close {
        color: #e5e7eb !important;
        background-color: #4b5563 !important;
        border-radius: 12px !important;
        width: 32px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        margin-right: 8px !important;
      }

      .ant-modal-close-x,
      .ant-drawer-close .anticon {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        height: 100% !important;
        width: 100% !important;
      }

      .ant-modal-close:hover,
      .ant-drawer-close:hover {
        background-color: #6b7280 !important;
        color: #ffffff !important;
      }

      /* Fix drawer header alignment */
      .ant-drawer-header {
        padding: 16px 24px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
      }

      .ant-drawer-header-title {
        flex: 1 !important;
        padding-left: 12px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      }

      .ant-drawer-title {
        margin-bottom: 0 !important;
      }

      /* Dark mode for popconfirm */
      .ant-popover-inner {
        background-color: #1f2937 !important;
        border: 1px solid #374151 !important;
      }

      .ant-popconfirm-title,
      .ant-popconfirm-description {
        color: #e5e7eb !important;
      }

      .ant-popover-arrow::before {
        background-color: #1f2937 !important;
      }

      .ant-popover-title,
      .ant-popover-message {
        color: #f3f4f6 !important;
      }

      .ant-popover-buttons .ant-btn-default {
        background-color: #374151 !important;
        border-color: #4b5563 !important;
        color: #e5e7eb !important;
      }

      .ant-popover-buttons .ant-btn-default:hover {
        background-color: #4b5563 !important;
      }

      /* Table styling */
      .dark-table .ant-table {
        background-color: #1f2937;
        color: #f3f4f6;
      }

      .dark-table .ant-table-thead > tr > th {
        background-color: #111827 !important;
        color: #e5e7eb !important;
        font-weight: bold;
        border-bottom: 1px solid #374151;
      }

      .dark-table .ant-table-tbody > tr > td {
        background-color: #1f2937 !important;
        color: #e5e7eb !important;
        border-bottom: 1px solid #374151;
      }

      .dark-table .ant-table-tbody > tr:hover > td {
        background-color: #374151 !important;
      }

      .dark-table .ant-empty-description {
        color: #9ca3af;
      }

      .dark-table .ant-pagination-item a {
        color: #e5e7eb;
      }

      .dark-table .ant-pagination-item-active {
        background-color: #3b82f6;
        border-color: #3b82f6;
      }

      .dark-table .ant-pagination-item-active a {
        color: white;
      }

      .dark-table .ant-table-column-sorter {
        color: #9ca3af;
      }

      /* Inputs styling */
      .dark-input,
      .dark-select .ant-select-selector {
        background-color: #374151 !important;
        border-color: #4b5563 !important;
        color: #e5e7eb !important;
      }

      /* Fix number input text color */
      .dark-input-number {
        background-color: #374151 !important;
        border-color: #4b5563 !important;
      }

      .dark-input-number .ant-input-number-input,
      .dark-input-number input {
        color: #e5e7eb !important;
      }

      .ant-input-number .ant-input-number-input,
      .ant-input-number input {
        color: #e5e7eb !important;
      }

      .dark-input-number .ant-input-number-handler-wrap {
        background-color: #262e3a !important;
      }

      .dark-input-number .ant-input-number-handler {
        border-color: #5a6677 !important;
      }

      .dark-input-number .ant-input-number-handler-up-inner,
      .dark-input-number .ant-input-number-handler-down-inner {
        color: #ffffff !important;
      }

      .dark-input::placeholder,
      .dark-input-number::placeholder {
        color: #9ca3af !important;
      }

      .dark-select .ant-select-arrow {
        color: #9ca3af;
      }

      .dark-dropdown {
        background-color: #1f2937 !important;
      }

      .dark-dropdown .ant-select-item {
        color: #e5e7eb !important;
      }

      .dark-dropdown .ant-select-item-option-active,
      .dark-dropdown .ant-select-item-option-selected {
        background-color: #374151 !important;
      }

      .dark-button-secondary {
        background-color: #374151 !important;
        border-color: #4b5563 !important;
        color: #e5e7eb !important;
      }

      .dark-button-secondary:hover {
        background-color: #4b5563 !important;
        border-color: #6b7280 !important;
      }

      .ant-select-dropdown {
        direction: rtl;
        text-align: right;
      }

      .ant-form-item-explain-error {
        color: #ef4444 !important;
      }
    `}</style>
  );
};

export default Styles;
