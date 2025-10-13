"use client";

// Custom lightweight UI replacing antd components
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import ProductsModal from "./components/ProductsModal";
import { AutoCompleteBase, ButtonBase, InputBase } from "./components/ui";
import WarehouseFormModal from "./components/WarehouseFormModal";
import WarehousesTable from "./components/WarehousesTable";
import Styles from "./styles";

type Warehouse = {
  warehouseid: number;
  name: string;
  location: string | null;
  createdat: string | null;
  productCount: number;
  totalQuantity: number;
};

type Product = {
  ProductId: number;
  Type: string | null;
};

function WarehousesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Warehouse[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState<string | undefined>(undefined);

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
  const notify = (type: "success" | "error" | "warning", text: string) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, type, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const fetchWarehouses = async (searchProductId?: string) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: searchProductId ? 1 : page,
        limit: searchProductId ? 100 : 20,
        q: q || undefined,
      };

      if (searchProductId) {
        params.productId = searchProductId;
      }

      const res = await axios.get("/api/admin/warehouses", { params });
      setItems(res.data.items);
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
  };

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

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get("/api/admin/products/all", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const products = response.data?.data || response.data || [];
      if (Array.isArray(products)) {
        setAllProducts(products);
        if (productId && !selectedProduct) {
          const urlProduct = products.find((p: Product) => p.ProductId === parseInt(productId));
          if (urlProduct) {
            setSelectedProduct(urlProduct);
            setSearchQuery(urlProduct.Type || "");
          }
        }
      }
    } catch (e) {
      console.error(e);
      notify("error", "خطا در دریافت لیست محصولات");
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedProduct) {
        await fetchWarehouses(String(selectedProduct.ProductId));
      } else if (q) {
        await fetchWarehouses();
      } else {
        await fetchWarehouses();
      }
    };

    fetchData();
  }, [selectedProduct, page, q]);

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
    try {
      if (editing) {
        await axios.put(`/api/admin/warehouses/${editing.warehouseid}`, {
          name: formName,
          location: formLocation,
        });
      } else {
        await axios.post(`/api/admin/warehouses`, { name: formName, location: formLocation });
      }
      setIsModalOpen(false);
      fetchWarehouses();
    } catch (e) {
      console.error(e);
    }
  };
  const deleteWarehouse = async (wh: Warehouse) => {
    try {
      await axios.delete(`/api/admin/warehouses/${wh.warehouseid}`);
      fetchWarehouses();
    } catch (e) {
      console.error(e);
    }
  };

  const openProducts = (wh: Warehouse) => {
    setProductModal({ open: true, warehouseId: wh.warehouseid, warehouseName: wh.name });
  };

  // Columns moved into WarehousesTable component

  return (
    <div
      className="space-y-6 rounded-lg bg-gray-950 p-4 text-white sm:p-6"
      style={{ direction: "rtl" }}
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
            <InputBase
              placeholder="جستجو نام انبار"
              value={q}
              onChange={(e) => setQ((e.target as HTMLInputElement).value)}
              className="w-64"
            />
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded bg-emerald-600 px-4 py-2 text-white transition-all hover:bg-emerald-700"
            >
              <span className="-mt-0.5 text-lg">＋</span>
              ایجاد انبار
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <AutoCompleteBase
          value={searchQuery}
          onChange={handleProductSearch}
          placeholder="جستجوی محصول در انبارها"
          options={allProducts
            .filter((p) => p.Type?.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((p) => ({ value: p.Type || "", label: p.Type, productId: String(p.ProductId) }))}
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
            <ButtonBase
              className="mr-2 text-xs"
              onClick={() => {
                setSearchQuery("");
                setSelectedProduct(null);
                fetchWarehouses();
                router.push("/admin/warehouses");
              }}
            >
              پاک کردن
            </ButtonBase>
          </div>
        )}
      </div>

      <WarehousesTable
        items={items}
        loading={loading}
        page={page}
        total={total}
        onPageChange={(p) => setPage(p)}
        onEdit={openEdit}
        onDelete={deleteWarehouse}
        onProducts={openProducts}
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
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[300px] flex-col gap-2">
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
      <Styles />
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
