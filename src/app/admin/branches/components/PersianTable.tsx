import { Table, TableProps, TablePaginationConfig } from "antd";
import React from "react";

import PersianPagination from "./PersianPagination";

// Use generic type parameter to make the component work with any data type
function renderPagination(pagination: TablePaginationConfig) {
  if (!pagination) return false;

  // Make sure the quick jumper is always disabled
  const modifiedPagination = {
    ...pagination,
    showQuickJumper: false,
  };

  // Return a PersianPagination component instead of the default pagination
  return {
    ...modifiedPagination,
    // This render function will be used by Table to render pagination
    render: (paginationProps: TablePaginationConfig) => (
      <PersianPagination
        {...paginationProps}
        showQuickJumper={false}
        className={`${pagination.className || ""} persian-pagination`}
      />
    ),
  };
}

function PersianTable<RecordType extends object = Record<string, unknown>>(
  props: TableProps<RecordType>
) {
  return (
    <Table {...props} pagination={props.pagination ? renderPagination(props.pagination) : false} />
  );
}

export default PersianTable;
