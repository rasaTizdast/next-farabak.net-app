"use client";

import axios from "axios";
import React, { useState } from "react";

import {
  AutoCompleteBase,
  ButtonBase,
  InputBase,
  ModalBase,
  TableBase,
  useBodyScrollLock,
} from "./ui";

type WarehouseProduct = {
  ProductId: number;
  Type: string | null;
  Name: string | null;
  quantity: number;
};

type Product = {
  ProductId: number;
  Type: string | null;
};

export default function ProductsModal({
  open,
  onClose,
  warehouseId,
  warehouseName,
  allProducts,
  refreshWarehouses,
}: {
  open: boolean;
  onClose: () => void;
  warehouseId?: number;
  warehouseName?: string;
  allProducts: Product[];
  refreshWarehouses: () => void;
}) {
  useBodyScrollLock(open);
  const [productLoading, setProductLoading] = useState(false);
  const [products, setProducts] = useState<WarehouseProduct[]>([]);
  const [addProductId, setAddProductId] = useState("");
  const [addProductName, setAddProductName] = useState("");
  const [addQuantity, setAddQuantity] = useState("0");
  const [actionLoading, setActionLoading] = useState<{
    add: boolean;
    modify: Record<number, boolean>;
    remove: Record<number, boolean>;
  }>({ add: false, modify: {}, remove: {} });

  React.useEffect(() => {
    const fetch = async () => {
      if (!open || !warehouseId) return;
      setProductLoading(true);
      try {
        const res = await axios.get(`/api/admin/warehouses/${warehouseId}/products`);
        setProducts(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setProductLoading(false);
      }
    };
    fetch();
  }, [open, warehouseId]);

  const updateQuantity = async (productId: number, value: number) => {
    if (!warehouseId) return;
    setActionLoading((prev) => ({ ...prev, modify: { ...prev.modify, [productId]: true } }));
    try {
      await axios.put(`/api/admin/warehouses/${warehouseId}/products/${productId}`, {
        quantity: value,
      });
      setProducts((prev) =>
        prev.map((p) => (p.ProductId === productId ? { ...p, quantity: value } : p))
      );
      refreshWarehouses();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((prev) => ({ ...prev, modify: { ...prev.modify, [productId]: false } }));
    }
  };

  const removeProduct = async (productId: number) => {
    if (!warehouseId) return;
    setActionLoading((prev) => ({ ...prev, remove: { ...prev.remove, [productId]: true } }));
    try {
      await axios.delete(`/api/admin/warehouses/${warehouseId}/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.ProductId !== productId));
      refreshWarehouses();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading((prev) => ({ ...prev, remove: { ...prev.remove, [productId]: false } }));
    }
  };

  return (
    <ModalBase
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">محصولات انبار {warehouseName}</span>
          <span className="text-sm text-gray-400">
            {products.length > 0 ? `${products.length} محصول` : "بدون محصول"}
          </span>
        </div>
      }
      width={900}
    >
      <div className="mb-6 rounded-lg bg-gray-800 p-4">
        <h4 className="mb-4 text-sm font-medium text-gray-300">افزودن محصول جدید</h4>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex min-w-[250px] flex-1 flex-col gap-2">
            <label className="text-xs text-gray-400">نام محصول</label>
            <AutoCompleteBase
              options={allProducts.map((p) => ({
                value: p.Type || "",
                productId: String(p.ProductId),
                label: (
                  <div>
                    <span>{p.Type}</span>
                  </div>
                ),
              }))}
              value={addProductName}
              onChange={(value: string) => {
                setAddProductName(value);
                const foundExact = allProducts.find((x) => (x.Type || "") === value);
                setAddProductId(foundExact ? String(foundExact.ProductId) : "");
              }}
              onSelect={(value: string, option: any) => {
                setAddProductName(value);
                setAddProductId(option.productId);
              }}
              placeholder="جستجو و انتخاب محصول"
            />
            {addProductName && !addProductId && (
              <span className="text-xs text-amber-400">
                برای افزودن، یک مورد معتبر از لیست انتخاب کنید
              </span>
            )}
          </div>
          <div className="flex w-32 flex-col gap-2">
            <label className="text-xs text-gray-400">تعداد</label>
            <InputBase
              type="number"
              min={1}
              value={addQuantity}
              onChange={(e) => setAddQuantity((e.target as HTMLInputElement).value)}
            />
          </div>
          <ButtonBase
            variant="primary"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            loading={actionLoading.add}
            disabled={!addProductId || !addQuantity || parseInt(addQuantity || "0") < 1}
            onClick={async () => {
              if (!warehouseId) return;
              const pid = parseInt(addProductId || "0");
              const qty = Math.max(1, parseInt(addQuantity || "0"));
              if (!pid || qty < 1) return;
              setActionLoading((prev) => ({ ...prev, add: true }));
              try {
                await axios.post(`/api/admin/warehouses/${warehouseId}/products`, {
                  productId: pid,
                  quantity: qty,
                });
                const res = await axios.get(`/api/admin/warehouses/${warehouseId}/products`);
                setProducts(res.data);
                setAddProductId("");
                setAddProductName("");
                setAddQuantity("0");
                refreshWarehouses();
              } catch (e) {
                console.error(e);
              } finally {
                setActionLoading((prev) => ({ ...prev, add: false }));
              }
            }}
          >
            <span className="-mt-0.5 text-lg">＋</span>
            افزودن محصول
          </ButtonBase>
        </div>
      </div>

      <TableBase<WarehouseProduct>
        data={products}
        rowKey={(r) => r.ProductId}
        loading={productLoading}
        pagination={false as any}
        columns={[
          { title: "نام محصول", dataIndex: "Type", key: "Type" },
          {
            title: "تعداد",
            key: "quantity",
            render: (_: any, record: WarehouseProduct) => (
              <div className="flex items-center gap-2">
                <InputBase
                  type="number"
                  min={0}
                  className="w-24"
                  value={record.quantity}
                  disabled={actionLoading.modify[record.ProductId]}
                  onChange={(e) =>
                    updateQuantity(
                      record.ProductId,
                      Math.max(0, parseInt((e.target as HTMLInputElement).value || "0"))
                    )
                  }
                />
              </div>
            ),
          },
          {
            title: "عملیات",
            key: "actions",
            render: (_: any, record: WarehouseProduct) => (
              <ButtonBase
                variant="danger"
                loading={actionLoading.remove[record.ProductId]}
                onClick={() => removeProduct(record.ProductId)}
                className="flex items-center gap-2"
              >
                حذف
              </ButtonBase>
            ),
          },
        ]}
      />
    </ModalBase>
  );
}
