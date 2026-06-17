"use client";

import { useEffect, useState } from "react";
import { useApiMutation } from "@/hooks/useApiMutation";

import {
  AutoCompleteBase,
  ButtonBase,
  InputBase,
  ModalBase,
  TableBase,
  useBodyScrollLock,
} from "./ui";

type WarehouseProduct = {
  warehouseproductid: number; // Add unique identifier for the warehouseproduct record
  ProductId: number;
  Type: string | null;
  Name: string | null;
  quantity: number;
  ProductGradeId: number | null;
  ProductGrade: {
    Grade: string;
    Price: number;
  } | null;
  availableGrades: {
    ProductGradeId: number;
    Grade: string;
    Price: number;
  }[];
};

type Product = {
  ProductId: number;
  Type: string | null;
  ProductGrade?: {
    ProductGradeId: number;
    Grade: string;
    Price: number;
  }[];
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
  const { mutate: updateMutate } = useApiMutation("put");
  const { mutate: deleteMutate } = useApiMutation("delete");
  const { mutate: addMutate } = useApiMutation("post");
  const [addProductId, setAddProductId] = useState("");
  const [addProductName, setAddProductName] = useState("");
  const [addQuantity, setAddQuantity] = useState("0");
  const [addGradeId, setAddGradeId] = useState<string>("");

  // Fetch available grades for the selected product
  const selectedProduct = allProducts.find((p) => String(p.ProductId) === addProductId);
  const availableGrades = selectedProduct?.ProductGrade || [];
  const [actionLoading, setActionLoading] = useState<{
    add: boolean;
    modify: Record<number, boolean>;
    remove: Record<number, boolean>;
  }>({ add: false, modify: {}, remove: {} });

  useEffect(() => {
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

  const updateQuantity = async (wpId: number, value: number) => {
    if (!warehouseId) return;
    setActionLoading((prev) => ({ ...prev, modify: { ...prev.modify, [wpId]: true } }));
    const res = await updateMutate(`/api/admin/warehouses/${warehouseId}/products/${wpId}`, {
      quantity: value,
    });
    if (res) {
      setProducts((prev) =>
        prev.map((p) => (p.warehouseproductid === wpId ? { ...p, quantity: value } : p))
      );
      refreshWarehouses();
    }
    setActionLoading((prev) => ({ ...prev, modify: { ...prev.modify, [wpId]: false } }));
  };

  const updateGrade = async (
    productId: number,
    gradeId: number | null,
    currentQuantity: number,
    currentWarehouseProductId: number
  ) => {
    if (!warehouseId) return;
    setActionLoading((prev) => ({
      ...prev,
      modify: { ...prev.modify, [currentWarehouseProductId]: true },
    }));
    try {
      const existingWithGrade = products.find(
        (p) =>
          p.ProductId === productId &&
          p.ProductGradeId === gradeId &&
          p.warehouseproductid !== currentWarehouseProductId
      );

      if (existingWithGrade) {
        const r1 = await updateMutate(
          `/api/admin/warehouses/${warehouseId}/products/${existingWithGrade.warehouseproductid}`,
          { quantity: existingWithGrade.quantity + currentQuantity }
        );
        if (r1) {
          await deleteMutate(
            `/api/admin/warehouses/${warehouseId}/products/${currentWarehouseProductId}`
          );
        }
      } else {
        await updateMutate(
          `/api/admin/warehouses/${warehouseId}/products/${currentWarehouseProductId}`,
          { ProductGradeId: gradeId, quantity: currentQuantity }
        );
      }

      const res = await fetch(`/api/admin/warehouses/${warehouseId}/products`);
      setProducts(await res.json());
      refreshWarehouses();
    } catch (e) {
      console.error("Error updating grade:", e);
      alert((e as any)?.response?.data?.error || "خطا در بروزرسانی گرید محصول");
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        modify: { ...prev.modify, [currentWarehouseProductId]: false },
      }));
    }
  };

  const removeProduct = async (product: WarehouseProduct) => {
    if (!warehouseId) return;
    setActionLoading((prev) => ({
      ...prev,
      remove: { ...prev.remove, [product.warehouseproductid]: true },
    }));
    const res = await deleteMutate(
      `/api/admin/warehouses/${warehouseId}/products/${product.warehouseproductid}`
    );
    if (res) {
      setProducts((prev) => prev.filter((p) => p.warehouseproductid !== product.warehouseproductid));
      refreshWarehouses();
    } else {
      alert("خطا در حذف محصول از انبار");
    }
    setActionLoading((prev) => ({
      ...prev,
      remove: { ...prev.remove, [product.warehouseproductid]: false },
    }));
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
                setAddGradeId(""); // Reset grade when product changes
              }}
              onSelect={(value: string, option: any) => {
                setAddProductName(value);
                setAddProductId(option.productId);
                setAddGradeId(""); // Reset grade when product changes
              }}
              placeholder="جستجو و انتخاب محصول"
            />
            {addProductName && !addProductId && (
              <span className="text-xs text-amber-400">
                برای افزودن، یک مورد معتبر از لیست انتخاب کنید
              </span>
            )}
          </div>
          <div className="flex min-w-[150px] flex-col gap-2">
            <label className="text-xs text-gray-400">گرید محصول</label>
            <div className="relative">
              <select
                className={`w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white transition-all duration-200 ${
                  !selectedProduct || !addProductId ? "cursor-not-allowed opacity-30" : ""
                } ${!selectedProduct || selectedProduct?.ProductGrade?.length === 0 ? "text-transparent" : ""}`}
                value={addGradeId}
                onChange={(e) => setAddGradeId(e.target.value)}
                disabled={!selectedProduct || !addProductId}
              >
                <option value="">بدون گرید</option>
                {availableGrades.map((grade) => (
                  <option key={grade.ProductGradeId} value={grade.ProductGradeId}>
                    گرید {grade.Grade}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-0 flex items-center px-3">
                {!selectedProduct ? (
                  <span className="text-xs text-gray-400">ابتدا محصول را انتخاب کنید</span>
                ) : selectedProduct && !availableGrades.length && addProductId ? (
                  <span className="text-xs text-gray-400">بدون گرید</span>
                ) : null}
              </div>
            </div>
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

              // No need to validate grade selection - it's optional

              setActionLoading((prev) => ({ ...prev, add: true }));
              const result = await addMutate(`/api/admin/warehouses/${warehouseId}/products`, {
                productId: pid,
                quantity: qty,
                ProductGradeId: addGradeId ? parseInt(addGradeId) : null,
              });
              if (result) {
                const res = await fetch(`/api/admin/warehouses/${warehouseId}/products`);
                setProducts(await res.json());

                setAddProductId("");
                setAddProductName("");
                setAddQuantity("0");
                setAddGradeId("");
                refreshWarehouses();
              } else {
                alert("خطا در افزودن محصول به انبار");
              }
              setActionLoading((prev) => ({ ...prev, add: false }));
            }}
          >
            <span className="-mt-0.5 text-lg">＋</span>
            افزودن محصول
          </ButtonBase>
        </div>
      </div>

      <TableBase<WarehouseProduct>
        data={products}
        rowKey={(r) => r.warehouseproductid}
        loading={productLoading}
        pagination={false as any}
        columns={[
          { title: "نام محصول", dataIndex: "Type", key: "Type" },
          {
            title: "گرید",
            key: "grade",
            render: (_: any, record: WarehouseProduct) => {
              const grades = record.availableGrades || [];
              const isLoading = actionLoading.modify[record.warehouseproductid];
              return (
                <div className="flex min-h-[36px] items-center gap-2">
                  <div className="relative min-w-[150px]">
                    <select
                      className={`w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-white transition-opacity duration-200 ${
                        isLoading ? "opacity-50" : ""
                      } ${!grades.length ? "cursor-not-allowed opacity-50" : ""}`}
                      value={record.ProductGradeId || ""}
                      onChange={async (e) => {
                        const value = e.target.value;
                        try {
                          await updateGrade(
                            record.ProductId,
                            value ? parseInt(value) : null,
                            record.quantity,
                            record.warehouseproductid // Pass the warehouseproductid
                          );
                        } catch (error: any) {
                          alert(error.response?.data?.error || "خطا در بروزرسانی گرید محصول");
                        }
                      }}
                      disabled={isLoading || !grades.length}
                      style={{ opacity: isLoading ? 0.5 : 1 }}
                    >
                      <option value="">بدون گرید</option>
                      {grades.map((grade) => (
                        <option key={grade.ProductGradeId} value={grade.ProductGradeId}>
                          گرید {grade.Grade}
                        </option>
                      ))}
                    </select>
                    {isLoading && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></span>
                      </div>
                    )}
                  </div>
                  {isLoading && (
                    <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-blue-400">
                      در حال بروزرسانی...
                    </span>
                  )}
                  {!grades.length && !isLoading && (
                    <span className="text-xs text-gray-400">بدون گرید</span>
                  )}
                </div>
              );
            },
          },
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
                  disabled={actionLoading.modify[record.warehouseproductid]}
                  onChange={(e) =>
                    updateQuantity(
                      record.warehouseproductid,
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
                loading={actionLoading.remove[record.warehouseproductid]}
                onClick={() => removeProduct(record)}
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
