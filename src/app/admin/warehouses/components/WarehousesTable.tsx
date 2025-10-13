"use client";

import { useMemo } from "react";

import { ButtonBase, TableBase } from "./ui";

type Warehouse = {
  warehouseid: number;
  name: string;
  location: string | null;
  createdat: string | null;
  productCount: number;
  totalQuantity: number;
};

export default function WarehousesTable({
  items,
  loading,
  page,
  total,
  onPageChange,
  onEdit,
  onDelete,
  onProducts,
}: {
  items: Warehouse[];
  loading: boolean;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (w: Warehouse) => void;
  onDelete: (w: Warehouse) => void;
  onProducts: (w: Warehouse) => void;
}) {
  const columns = useMemo(
    () => [
      { title: "نام", dataIndex: "name", key: "name" },
      { title: "مکان", dataIndex: "location", key: "location" },
      { title: "تعداد محصولات", dataIndex: "productCount", key: "productCount" },
      { title: "تعداد کل", dataIndex: "totalQuantity", key: "totalQuantity" },
      {
        title: "عملیات",
        key: "actions",
        render: (_: any, record: Warehouse) => (
          <div className="flex gap-2">
            <ButtonBase
              onClick={() => onEdit(record)}
              className="flex items-center gap-2 !bg-amber-600 hover:!bg-amber-700"
              variant="primary"
            >
              ویرایش
            </ButtonBase>
            <ButtonBase
              onClick={() => onDelete(record)}
              className="flex items-center gap-2"
              variant="danger"
            >
              حذف
            </ButtonBase>
            <ButtonBase
              onClick={() => onProducts(record)}
              className="flex items-center gap-2"
              variant="primary"
            >
              محصولات
            </ButtonBase>
          </div>
        ),
      },
    ],
    [onEdit, onDelete, onProducts]
  );

  return (
    <TableBase
      data={items}
      rowKey={(r) => r.warehouseid}
      columns={columns as any}
      loading={loading}
      pagination={{ current: page, pageSize: 20, total, onChange: (p) => onPageChange(p) }}
    />
  );
}
