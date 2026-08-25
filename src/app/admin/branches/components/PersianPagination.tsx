import { Pagination, PaginationProps } from "antd";
import React from "react";

const persianLocale = {
  // Override the English text with Persian
  items_per_page: "/ صفحه",
  jump_to: "برو به",
  jump_to_confirm: "تایید",
  page: "صفحه",
  prev_page: "قبلی",
  next_page: "بعدی",
  prev_5: "۵ صفحه قبل",
  next_5: "۵ صفحه بعد",
  prev_3: "۳ صفحه قبل",
  next_3: "۳ صفحه بعد",
};

const PersianPagination: React.FC<PaginationProps> = (props) => {
  // Always force quick jumper to be false
  const modifiedProps = {
    ...props,
    showQuickJumper: false,
  };

  return (
    <>
      <Pagination
        {...modifiedProps}
        className={`persian-pagination !my-4 [&_.ant-pagination-item]:!border-gray-600 [&_.ant-pagination-item_a]:!text-gray-200 [&_.ant-pagination-item-active_a]:!text-white [&_.ant-pagination-next_button]:!border-gray-600 [&_.ant-pagination-next_button]:!bg-gray-800 [&_.ant-pagination-next_button]:!text-gray-200 [&_.ant-pagination-options-size-changer_.ant-select-selection-item]:!text-[0] [&_.ant-pagination-options-size-changer_.ant-select-selection-item::before]:!text-[14px] [&_.ant-pagination-options-size-changer_.ant-select-selection-item::before]:!content-[attr(title)] [&_.ant-pagination-prev_button]:!border-gray-600 [&_.ant-pagination-prev_button]:!bg-gray-800 [&_.ant-pagination-prev_button]:!text-gray-200 ${props.className || ""}`}
        locale={persianLocale}
      />
    </>
  );
};

export default PersianPagination;
