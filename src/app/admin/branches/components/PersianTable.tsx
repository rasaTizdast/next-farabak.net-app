import React from 'react';
import { Table, TableProps } from 'antd';
import PersianPagination from './PersianPagination';

// Use generic type parameter to make the component work with any data type
function PersianTable<RecordType extends object = any>(
  props: TableProps<RecordType>
) {
  // Create a custom render for the pagination 
  const renderPagination = (pagination: any) => {
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
      render: (paginationProps: any) => (
        <PersianPagination 
          {...paginationProps}
          showQuickJumper={false}
          className={`${pagination.className || ''} persian-pagination`}
        />
      )
    };
  };

  return (
    <Table
      {...props}
      pagination={props.pagination ? renderPagination(props.pagination) : false}
    />
  );
}

export default PersianTable; 