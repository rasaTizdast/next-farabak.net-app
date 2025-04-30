import React from 'react';
import { Pagination, PaginationProps } from 'antd';

interface PersianPaginationProps extends PaginationProps {
  // Add any additional props if needed
}

const PersianPagination: React.FC<PersianPaginationProps> = (props) => {
  // Create a modified version of the locale object
  const persianLocale = {
    // Override the English text with Persian
    items_per_page: '/ صفحه',
    jump_to: 'برو به',
    jump_to_confirm: 'تایید',
    page: 'صفحه',
    prev_page: 'قبلی',
    next_page: 'بعدی',
    prev_5: '۵ صفحه قبل',
    next_5: '۵ صفحه بعد',
    prev_3: '۳ صفحه قبل',
    next_3: '۳ صفحه بعد',
  };

  // Always force quick jumper to be false
  const modifiedProps = {
    ...props,
    showQuickJumper: false,
  };

  return (
    <>
      <Pagination
        {...modifiedProps}
        className={`persian-pagination ${props.className || ''}`}
        locale={persianLocale}
      />

      <style jsx global>{`
        /* Custom styles for Persian pagination */
        .persian-pagination {
          margin: 16px 0;
          direction: rtl !important;
        }
        
        .persian-pagination .ant-pagination-item {
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        
        .persian-pagination .ant-pagination-item a {
          color: #e5e7eb !important;
        }
        
        .persian-pagination .ant-pagination-item-active {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
        
        .persian-pagination .ant-pagination-item-active a {
          color: white !important;
        }
        
        .persian-pagination .ant-pagination-prev button,
        .persian-pagination .ant-pagination-next button {
          color: #e5e7eb !important;
          background-color: #1f2937 !important;
          border-color: #4b5563 !important;
        }
        
        /* Ensure the page size selector text is in Persian */
        .persian-pagination .ant-select-selection-item::after {
          content: " / صفحه" !important;
          margin-right: 4px !important;
        }
        
        /* Hide the original "/ page" text from the selector */
        .persian-pagination .ant-pagination-options-size-changer .ant-select-selection-item {
          font-size: 0 !important;
        }
        
        .persian-pagination .ant-pagination-options-size-changer .ant-select-selection-item::before {
          content: attr(title) !important;
          font-size: 14px !important;
        }
      `}</style>
    </>
  );
};

export default PersianPagination; 