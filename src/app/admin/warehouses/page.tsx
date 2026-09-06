"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { AutoComplete } from "@/components/ui/antd/AutoComplete";
import { Button } from "@/components/ui/antd/Button";
import { Input } from "@/components/ui/antd/Input";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

import ProductsModal from "./components/ProductsModal";
import WarehouseFormModal from "./components/WarehouseFormModal";
import WarehousesTable from "./components/WarehousesTable";

type Warehouse = {
  warehouseid: number;
  name: string;
  location: string | null;
  createdat: string | null;
  productCount: number;
  totalQuantity: number;
  // Returned only when searching by a specific product
  specificProductQuantity?: number;
};

type Product = {
  ProductId: number;
  Type: string | null;
};

type WarehouseApiItem = {
  warehouseid: number;
  name: string;
  location: string | null;
  createdat: string | null;
  productCount: number;
  totalQuantity: number;
  specificProductQuantity?: number;
  specific_product_quantity?: number;
  productSpecificQuantity?: number;
  product_specific_quantity?: number;
  productQuantity?: number;
  product_quantity?: number;
  quantity?: number | string;
};

async function doFetchWarehouses(
  searchProductId: string | undefined,
  page: number,
  q: string,
  setLoading: (v: boolean) => void,
  setItems: (items: Warehouse[]) => void,
  setTotal: (total: number) => void,
  notify: (type: "success" | "error" | "warning", text: string) => void
) {
  setLoading(true);
  try {
    const params: Record<string, unknown> = {
      page: searchProductId ? 1 : page,
      limit: searchProductId ? 100 : 20,
      q: q || undefined,
    };

    if (searchProductId) {
      params.productId = searchProductId;
    }

    const res = await axios.get<{
      items?: WarehouseApiItem[];
      data?: WarehouseApiItem[];
      total: number;
    }>("/api/admin/warehouses", { params });
    const rawItems = res.data.items || res.data.data || [];
    const normalized = (Array.isArray(rawItems) ? rawItems : []).map((it: WarehouseApiItem) => {
      const possible =
        it?.specificProductQuantity ??
        it?.specific_product_quantity ??
        it?.productSpecificQuantity ??
        it?.product_specific_quantity ??
        it?.productQuantity ??
        it?.product_quantity ??
        it?.quantity;
      const qty = (typeof possible === "string" ? parseInt(possible) : possible) ?? 0;
      return {
        ...it,
        specificProductQuantity: Number.isFinite(qty) && qty >= 0 ? qty : 0,
      } as Warehouse;
    });
    setItems(normalized);
    setTotal(res.data.total);
  } catch (e) {
    console.error(e);
    notify(
      "error",
      searchProductId ? "خطا در جستجوی محصول در انبارها" : "خطا در دریافت لیست انبارها"
    );
  } finally {
    setLoading(false);
  }
}

function WarehousesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Warehouse[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState<string | undefined>(undefined);

  const { mutate: saveWarehouseMutate } = useApiMutation();
  const { mutate: deleteWarehouseMutate } = useApiMutation("delete");

  const toastIdRef = useRef(0);

  const [productModal, setProductModal] = useState<{
    open: boolean;
    warehouseId?: number;
    warehouseName?: string;
  }>({
    open: false,
  });
  const [toasts, setToasts] = useState<
    { id: number; type: "success" | "error" | "warning"; text: string }[]
  >([]);
  const notify = useCallback((type: "success" | "error" | "warning", text: string) => {
    toastIdRef.current += 1;
    const id = toastIdRef.current;
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  // Refs for values read inside the stable callback
  const pageRef = useRef(page);
  const qRef = useRef(q);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);
  useEffect(() => {
    qRef.current = q;
  }, [q]);

  const fetchWarehouses = useCallback(
    async (searchProductId?: string) => {
      await doFetchWarehouses(
        searchProductId,
        pageRef.current,
        qRef.current,
        setLoading,
        setItems,
        setTotal,
        notify
      );
    },
    [notify]
  );

  const searchProductInWarehouses = async (searchProductId: number) => {
    await fetchWarehouses(String(searchProductId));
  };

  const handleProductSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSelectedProduct(null);
      setQ("");
      fetchWarehouses();
      router.push("/admin/warehouses");
      return;
    }

    const found = allProducts.find(
      (p) =>
        p.Type?.toLowerCase() === query.toLowerCase() ||
        p.Type?.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setSelectedProduct(found);
      searchProductInWarehouses(found.ProductId);
      router.push(`/admin/warehouses?productId=${found.ProductId}`);
    }
  };

  const { data: allProductsRaw } = useApiFetch<Product[]>("/api/admin/products/all");
  const allProducts = allProductsRaw ? (Array.isArray(allProductsRaw) ? allProductsRaw : []) : [];

  // Initialize selectedProduct and searchQuery from URL params
  if (productId && !selectedProduct && allProducts.length > 0) {
    const urlProduct = allProducts.find((p: Product) => p.ProductId === parseInt(productId));
    if (urlProduct) {
      setSelectedProduct(urlProduct);
      setSearchQuery(urlProduct.Type || "");
    }
  }

  // Fetch warehouses when selectedProduct, page, or q changes
  useEffect(() => {
    if (selectedProduct) {
      fetchWarehouses(String(selectedProduct.ProductId));
    } else {
      fetchWarehouses();
    }
  }, [selectedProduct, page, q, fetchWarehouses]);

  const openCreate = () => {
    setEditing(null);
    setFormName("");
    setFormLocation("");
    setIsModalOpen(true);
  };
  const openEdit = (wh: Warehouse) => {
    setEditing(wh);
    setFormName(wh.name);
    setFormLocation(wh.location ?? undefined);
    setIsModalOpen(true);
  };
  const saveWarehouse = async () => {
    const trimmedName = (formName || "").trim();
    const trimmedLocation = (formLocation || "").trim();
    if (!trimmedName || !trimmedLocation) {
      notify("warning", "نام و مکان انبار الزامی است");
      return;
    }
    const payload = { name: trimmedName, location: trimmedLocation };
    const res = editing
      ? await saveWarehouseMutate(`/api/admin/warehouses/${editing.warehouseid}`, payload)
      : await saveWarehouseMutate(`/api/admin/warehouses`, payload);
    if (res) {
      notify("success", editing ? "انبار با موفقیت بروزرسانی شد" : "انبار با موفقیت ایجاد شد");
      setIsModalOpen(false);
      fetchWarehouses();
    } else {
      notify("error", editing ? "خطا در بروزرسانی انبار" : "خطا در ایجاد انبار");
    }
  };
  const deleteWarehouse = async (wh: Warehouse) => {
    await deleteWarehouseMutate(`/api/admin/warehouses/${wh.warehouseid}`);
    fetchWarehouses();
  };
  const confirmAndDeleteWarehouse = async (wh: Warehouse) => {
    const ok =
      typeof window !== "undefined" ? window.confirm("آیا از حذف این انبار اطمینان دارید؟") : true;
    if (ok) {
      await deleteWarehouse(wh);
      notify("success", "انبار با موفقیت حذف شد");
    }
  };

  const openProducts = (wh: Warehouse) => {
    setProductModal({ open: true, warehouseId: wh.warehouseid, warehouseName: wh.name });
  };

  // Columns moved into WarehousesTable component

  return (
    <div
      className="space-y-6 rounded-lg bg-gray-950 p-4 text-white sm:p-6"
      style={{ direction: "rtl", marginTop: "16px" }}
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">مدیریت انبارها</h1>
          <p className="text-sm text-gray-400">
            از اینجا می‌توانید انبارها و محصولات آنها را مدیریت کنید
          </p>
        </div>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Input
              placeholder="جستجو انبار یا محصول..."
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded bg-emerald-600 px-4 py-1 whitespace-nowrap text-white transition-colors hover:bg-emerald-700"
            >
              <span className="text-lg">＋</span>
              ایجاد انبار
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <AutoComplete
          value={searchQuery}
          onChange={handleProductSearch}
          placeholder="جستجو انبار یا محصول..."
          options={allProducts.reduce<
            { value: string; label: string | undefined; productId: string }[]
          >((acc, p) => {
            if (p.Type?.toLowerCase().includes(searchQuery.toLowerCase())) {
              acc.push({ value: p.Type || "", label: p.Type, productId: String(p.ProductId) });
            }
            return acc;
          }, [])}
          onSelect={(value) => {
            setSearchQuery(value);
            const found = allProducts.find((x) => (x.Type || "") === value);
            if (found) {
              setSelectedProduct(found);
              searchProductInWarehouses(found.ProductId);
              router.push(`/admin/warehouses?productId=${found.ProductId}`);
            }
          }}
        />
        {selectedProduct && (
          <div className="mt-2 rounded bg-blue-900/30 p-2 text-sm text-blue-100">
            جستجو برای محصول: {selectedProduct.Type}
            <Button
              variant="secondary"
              className="mr-2 text-xs"
              onClick={() => {
                setSearchQuery("");
                setSelectedProduct(null);
                fetchWarehouses();
                router.push("/admin/warehouses");
              }}
            >
              پاک کردن
            </Button>
          </div>
        )}
        {(!selectedProduct || searchQuery.trim()) && (
          <div className="mt-2 text-sm text-gray-400">{total} انبار gefunden</div>
        )}
      </div>

      <WarehousesTable
        items={items}
        loading={loading}
        page={page}
        total={total}
        onPageChange={(p) => setPage(p)}
        onEdit={openEdit}
        onDelete={confirmAndDeleteWarehouse}
        onProducts={openProducts}
        isSearching={!!selectedProduct}
      />

      <WarehouseFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={saveWarehouse}
        editing={!!editing}
        formName={formName}
        setFormName={(v) => setFormName(v)}
        formLocation={formLocation}
        setFormLocation={(v) => setFormLocation(v)}
        existingWarehouses={items.map((item) => ({
          warehouseid: item.warehouseid,
          name: item.name,
        }))}
        editingWarehouseId={editing?.warehouseid}
      />

      <ProductsModal
        open={productModal.open}
        onClose={() => setProductModal({ open: false })}
        warehouseId={productModal.warehouseId}
        warehouseName={productModal.warehouseName}
        allProducts={allProducts}
        refreshWarehouses={() => fetchWarehouses()}
      />

      {/* Toasts */}
      <div className="pointer-events-none fixed top-4 left-1/2 z-50 flex w-[300px] -translate-x-1/2 flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded border px-3 py-2 text-sm shadow-lg ${
              t.type === "success"
                ? "border-emerald-600 bg-emerald-900/40 text-emerald-100"
                : t.type === "error"
                  ? "border-red-600 bg-red-900/40 text-red-100"
                  : "border-amber-600 bg-amber-900/40 text-amber-100"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WarehousesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-white">در حال بارگذاری...</div>}>
      <WarehousesPageContent />
    </Suspense>
  );
}
