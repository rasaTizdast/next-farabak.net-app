"use client";

import { Table, type TableProps } from "antd";

export function DataTable<T extends object>(props: TableProps<T>) {
  return (
    <Table
      size="middle"
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showTotal: (total) => `مجموع: ${total}`,
        ...props.pagination,
      }}
      locale={{ emptyText: "داده‌ای یافت نشد" }}
      {...props}
    />
  );
}
