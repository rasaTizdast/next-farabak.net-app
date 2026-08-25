"use client";
import { Table, TableProps } from "antd";

export function DataTable<T extends object>(props: TableProps<T>) {
  return (
    <Table<T>
      size="middle"
      pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `مجموع: ${total}` }}
      locale={{ emptyText: "داده‌ای یافت نشد" }}
      {...props}
    />
  );
}
