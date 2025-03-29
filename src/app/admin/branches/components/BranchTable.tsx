import React from 'react';
import { Table, Button, Popconfirm, Empty } from 'antd';
import { DeleteOutlined, EditOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Branch } from './types';
import StatusBadge from './StatusBadge';
import { toPersianDate } from './types';

interface BranchTableProps {
  branches: Branch[];
  loading: boolean;
  onEdit: (branch: Branch) => void;
  onDelete: (branchId: number) => void;
  onViewProducts: (branch: Branch) => void;
}

const BranchTable: React.FC<BranchTableProps> = ({
  branches,
  loading,
  onEdit,
  onDelete,
  onViewProducts
}) => {
  const columns = [
    {
      title: "کد مکان",
      dataIndex: "location",
      key: "location",
      width: "15%",
    },
    {
      title: "نام شعبه",
      dataIndex: "name",
      key: "name",
      width: "30%",
    },
    {
      title: "تاریخ ایجاد",
      dataIndex: "createdat",
      key: "createdat",
      width: "20%",
      render: (date: string) => (
        <span>{date ? toPersianDate(date) : "تاریخ نامشخص"}</span>
      ),
    },
    {
      title: "محصولات",
      dataIndex: "productCount",
      key: "productCount",
      width: "15%",
      render: (count: number, record: Branch) => (
        <StatusBadge productCount={count} totalQuantity={record.totalQuantity} />
      ),
    },
    {
      title: "عملیات",
      key: "actions",
      width: "25%",
      render: (_: any, branch: Branch) => (
        <div className="flex space-x-2 rtl:space-x-reverse">
          <Button
            icon={<EditOutlined />}
            onClick={() => onEdit(branch)}
            type="primary"
            size="small"
            className="bg-blue-600 hover:bg-blue-700 border-blue-700"
          >
            ویرایش
          </Button>
          <Button
            icon={<ShoppingOutlined />}
            onClick={() => onViewProducts(branch)}
            type="default"
            size="small"
            className="bg-gray-700 text-gray-100 border-gray-600 hover:bg-gray-600"
          >
            محصولات
          </Button>
          <Popconfirm
            title="حذف شعبه"
            description="آیا از حذف این شعبه اطمینان دارید؟"
            onConfirm={() => onDelete(branch.branchid)}
            okText="بله"
            cancelText="خیر"
            okButtonProps={{ className: "bg-red-600 hover:bg-red-700" }}
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              className="bg-red-500 text-white border-none"
            >
              حذف
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={branches}
          rowKey="branchid"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: "max-content" }}
          className="branch-table dark-table"
          locale={{
            emptyText: (
              <Empty
                description="هیچ شعبه‌ای یافت نشد"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                className="text-gray-400"
              />
            ),
          }}
        />
      </div>
    </div>
  );
};

export default BranchTable; 