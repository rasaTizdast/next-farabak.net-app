const Styles = () => {
  return (
    <style jsx global>{`
      /* Dark theme for tables */
      .dark-table {
        --table-bg: #1f2937;
        --row-hover: #374151;
      }

      .dark-table .ant-table {
        background-color: var(--table-bg) !important;
        color: #e5e7eb !important;
      }

      .dark-table .ant-table-thead > tr > th {
        background-color: #111827 !important;
        color: #e5e7eb !important;
        border-bottom: 1px solid #374151 !important;
      }

      .dark-table .ant-table-tbody > tr > td {
        background-color: var(--table-bg) !important;
        border-bottom: 1px solid #374151 !important;
        color: #e5e7eb !important;
      }

      .dark-table .ant-table-tbody > tr:hover > td {
        background-color: var(--row-hover) !important;
      }

      .dark-table .ant-table-tbody > tr.ant-table-row:hover > td {
        background-color: var(--row-hover) !important;
      }

      .dark-table .ant-pagination .ant-pagination-item a {
        color: #e5e7eb !important;
      }

      .dark-table .ant-pagination .ant-pagination-item-active {
        background-color: #3b82f6 !important;
        border-color: #3b82f6 !important;
      }

      /* Dark theme for modals */
      .dark-theme-modal .ant-modal-content {
        background-color: #1f2937 !important;
        color: #e5e7eb !important;
      }

      .dark-theme-modal .ant-modal-header {
        margin-bottom: 1rem;
        padding-bottom: 0.8rem;
        background-color: #1f2937 !important;
        border-bottom: 1px solid #374151 !important;
      }

      .dark-theme-modal .ant-modal-title {
        color: #e5e7eb !important;
      }

      .dark-theme-modal .ant-modal-close {
        color: #e5e7eb !important;
      }

      .dark-theme-modal .ant-modal-footer {
        margin-top: 1rem;
        padding-top: 0.8rem;
        border-top: 1px solid #374151 !important;
      }

      /* Dark theme for inputs */
      .dark-theme-modal .ant-input {
        background-color: #374151 !important;
        border-color: #4b5563 !important;
        color: #e5e7eb !important;
      }

      .dark-theme-modal .ant-input:hover,
      .dark-theme-modal .ant-input:focus {
        background-color: #4b5563 !important;
        border-color: #6b7280 !important;
      }

      /* Dark theme for AutoComplete */
      .product-search-dark .ant-select-selector {
        background-color: #374151 !important;
        border-color: #4b5563 !important;
      }

      .product-search-dark .ant-select-selection-search-input {
        color: #e5e7eb !important;
      }

      .ant-select-dropdown {
        background-color: #1f2937 !important;
        border: 1px solid #374151 !important;
      }

      .ant-select-item {
        color: #e5e7eb !important;
      }

      .ant-select-item-option-active {
        background-color: #374151 !important;
      }

      .ant-select-item-option-selected {
        background-color: #3b82f6 !important;
      }

      /* Style placeholder text for AutoComplete and Input */
      .ant-select-selection-placeholder,
      .ant-input::placeholder {
        color: #9ca3af !important;
        opacity: 1 !important;
      }
    `}</style>
  );
};

export default Styles;
