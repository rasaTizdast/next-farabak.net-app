"use client";

import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Modal, Table, Button, AutoComplete, message } from "antd";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import Styles from "./styles";

type Warehouse = {
  warehouseid: number;
  name: string;
  location: string | null;
  createdat: string | null;
  productCount: number;
  totalQuantity: number;
};

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

export default function WarehousesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Warehouse[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
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
  const [productLoading, setProductLoading] = useState(false);
  const [products, setProducts] = useState<WarehouseProduct[]>([]);
  const [addProductId, setAddProductId] = useState("");
  const [addProductName, setAddProductName] = useState("");
  const [addQuantity, setAddQuantity] = useState("0");
  const [actionLoading, setActionLoading] = useState<{
    add: boolean;
    modify: Record<number, boolean>;
    remove: Record<number, boolean>;
  }>({
    add: false,
    modify: {},
    remove: {},
  });

  const fetchWarehouses = async (searchProductId?: string) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: searchProductId ? 1 : page,
        limit: searchProductId ? 100 : limit,
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
      if (searchProductId) {
        message.error("خطا در جستجوی محصول در انبارها");
      } else {
        message.error("خطا در دریافت لیست انبارها");
      }
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
      router.push("/admin/warehouses"); // Clear URL when search is cleared
      return;
    }

    // If there's an exact match or close match from allProducts
    const found = allProducts.find(
      (p) =>
        p.Type?.toLowerCase() === query.toLowerCase() ||
        p.Type?.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      setSelectedProduct(found);
      searchProductInWarehouses(found.ProductId);
      router.push(`/admin/warehouses?productId=${found.ProductId}`); // Update URL with product ID
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
        // If we have a productId from URL, find and set the selected product
        if (productId && !selectedProduct) {
          const urlProduct = products.find((p) => p.ProductId === parseInt(productId));
          if (urlProduct) {
            setSelectedProduct(urlProduct);
            setSearchQuery(urlProduct.Type || "");
          }
        }
      }
    } catch (e) {
      console.error(e);
      message.error("خطا در دریافت لیست محصولات");
    }
  };

  // Initialize products list and handle URL product parameter
  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Handle warehouse fetching based on various states
  useEffect(() => {
    const fetchData = async () => {
      if (selectedProduct) {
        // If we have a selected product (either from search or URL), show only matching warehouses
        await fetchWarehouses(String(selectedProduct.ProductId));
      } else if (q) {
        // If we have a warehouse name search query, show filtered warehouses
        await fetchWarehouses();
      } else {
        // Show all warehouses
        await fetchWarehouses();
      }
    };

    fetchData();
  }, [selectedProduct, page, limit, q]);

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

  const openProducts = async (wh: Warehouse) => {
    setProductModal({ open: true, warehouseId: wh.warehouseid, warehouseName: wh.name });
    setProductLoading(true);
    try {
      const res = await axios.get(`/api/admin/warehouses/${wh.warehouseid}/products`);
      setProducts(res.data);
    } catch (e) {
      console.error(e);
      message.error("خطا در دریافت محصولات انبار");
    } finally {
      setProductLoading(false);
    }
  };

  const updateQuantity = async (productId: number, value: number) => {
    if (!productModal.warehouseId) return;
    setActionLoading((prev) => ({ ...prev, modify: { ...prev.modify, [productId]: true } }));
    try {
      await axios.put(`/api/admin/warehouses/${productModal.warehouseId}/products/${productId}`, {
        quantity: value,
      });
      setProducts((prev) =>
        prev.map((p) => (p.ProductId === productId ? { ...p, quantity: value } : p))
      );
      fetchWarehouses();
    } catch (e) {
      console.error(e);
      message.error("خطا در بروزرسانی تعداد محصول");
    } finally {
      setActionLoading((prev) => ({ ...prev, modify: { ...prev.modify, [productId]: false } }));
    }
  };

  const removeProduct = async (productId: number) => {
    if (!productModal.warehouseId) return;
    setActionLoading((prev) => ({ ...prev, remove: { ...prev.remove, [productId]: true } }));
    try {
      await axios.delete(`/api/admin/warehouses/${productModal.warehouseId}/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.ProductId !== productId));
      fetchWarehouses();
    } catch (e) {
      console.error(e);
      message.error("خطا در حذف محصول");
    } finally {
      setActionLoading((prev) => ({ ...prev, remove: { ...prev.remove, [productId]: false } }));
    }
  };

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
            <Button
              onClick={() => openEdit(record)}
              className="flex items-center gap-2"
              type="primary"
              style={{ backgroundColor: "#d97706" }}
            >
              ویرایش
            </Button>
            <Button
              onClick={() => deleteWarehouse(record)}
              className="flex items-center gap-2"
              danger
            >
              حذف
            </Button>
            <Button
              onClick={() => openProducts(record)}
              className="flex items-center gap-2"
              type="primary"
            >
              محصولات
            </Button>
          </div>
        ),
      },
    ],
    []
  );

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
            <Input
              placeholder="جستجو نام انبار"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-64 !bg-slate-800 text-white hover:!bg-slate-700 focus:bg-slate-700"
              prefix={<SearchOutlined className="text-gray-400" />}
            />
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded bg-emerald-600 px-4 py-1 text-white transition-all hover:bg-emerald-700"
            >
              <PlusOutlined />
              ایجاد انبار
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <AutoComplete
          className="product-search-dark w-full"
          value={searchQuery}
          onChange={handleProductSearch}
          placeholder="جستجوی محصول در انبارها"
          options={allProducts
            .filter((p) => p.Type?.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((p) => ({
              value: p.Type || "",
              label: p.Type,
            }))}
        />
        {selectedProduct && (
          <div className="mt-2 rounded bg-blue-900/30 p-2 text-sm text-blue-100">
            جستجو برای محصول: {selectedProduct.Type}
            <Button
              size="small"
              className="mr-2 text-xs"
              onClick={() => {
                setSearchQuery("");
                setSelectedProduct(null);
                fetchWarehouses();
              }}
            >
              پاک کردن
            </Button>
          </div>
        )}
      </div>
      <Table
        dataSource={items}
        rowKey={(r) => r.warehouseid}
        columns={columns as any}
        loading={loading}
        className="dark-table enhanced-table rtl-table"
        pagination={{
          current: page,
          pageSize: limit,
          total,
          onChange: (p, s) => {
            setPage(p);
            setLimit(s);
          },
        }}
      />

      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={saveWarehouse}
        okText={editing ? "ذخیره" : "ایجاد"}
        cancelText="انصراف"
        className="dark-theme-modal"
        title={editing ? "ویرایش انبار" : "ایجاد انبار جدید"}
      >
        <div className="space-y-4">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">نام انبار</span>
            <Input
              className="bg-slate-800 text-white hover:bg-slate-700 focus:bg-slate-700"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="نام انبار را وارد کنید"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-gray-300">مکان</span>
            <Input
              className="bg-slate-800 text-white hover:bg-slate-700 focus:bg-slate-700"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="مکان انبار را وارد کنید"
            />
          </label>
        </div>
      </Modal>

      <Modal
        open={productModal.open}
        onCancel={() => setProductModal({ open: false })}
        footer={null}
        width={900}
        className="dark-theme-modal"
        title={
          <div className="flex items-center justify-between pt-10">
            <span className="text-lg font-semibold">
              محصولات انبار {productModal.warehouseName}
            </span>
            <span className="text-sm text-gray-400">
              {products.length > 0 ? `${products.length} محصول` : "بدون محصول"}
            </span>
          </div>
        }
      >
        <div className="mb-6 rounded-lg bg-gray-800 p-4">
          <h4 className="mb-4 text-sm font-medium text-gray-300">افزودن محصول جدید</h4>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex min-w-[250px] flex-1 flex-col gap-2">
              <label className="text-xs text-gray-400">نام محصول</label>
              <AutoComplete
                className="product-search-dark"
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
                onChange={(value, option: any) => {
                  setAddProductName(value);
                  setAddProductId(option?.productId || "");
                }}
                onSelect={(value, option: any) => {
                  setAddProductName(value);
                  setAddProductId(option.productId);
                }}
                placeholder="جستجو و انتخاب محصول"
                filterOption={(inputValue, option) =>
                  option?.value?.toString().toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
                }
              />
            </div>
            <div className="flex w-32 flex-col gap-2">
              <label className="text-xs text-gray-400">تعداد</label>
              <Input
                type="number"
                min={0}
                className="bg-slate-700 text-white"
                value={addQuantity}
                onChange={(e) => setAddQuantity(e.target.value)}
              />
            </div>
            <Button
              type="primary"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
              loading={actionLoading.add}
              onClick={async () => {
                if (!productModal.warehouseId) return;
                const pid = parseInt(addProductId || "0");
                const qty = Math.max(0, parseInt(addQuantity || "0"));
                if (!pid) {
                  message.warning("لطفا محصول را انتخاب کنید");
                  return;
                }
                setActionLoading((prev) => ({ ...prev, add: true }));
                try {
                  await axios.post(`/api/admin/warehouses/${productModal.warehouseId}/products`, {
                    productId: pid,
                    quantity: qty,
                  });
                  // Refresh list to get product names
                  const res = await axios.get(
                    `/api/admin/warehouses/${productModal.warehouseId}/products`
                  );
                  setProducts(res.data);
                  setAddProductId("");
                  setAddProductName("");
                  setAddQuantity("0");
                  fetchWarehouses();
                  message.success("محصول با موفقیت اضافه شد");
                } catch (e) {
                  console.error(e);
                  message.error("خطا در افزودن محصول");
                } finally {
                  setActionLoading((prev) => ({ ...prev, add: false }));
                }
              }}
            >
              <PlusOutlined />
              افزودن محصول
            </Button>
          </div>
        </div>

        <Table
          dataSource={products}
          rowKey={(r) => r.ProductId}
          loading={productLoading}
          className="dark-table enhanced-table rtl-table"
          pagination={false}
          columns={[
            {
              title: "نام محصول",
              dataIndex: "Type",
              key: "Type",
            },
            {
              title: "تعداد",
              key: "quantity",
              render: (_: any, record: WarehouseProduct) => (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    className="w-24 bg-slate-700 text-white"
                    value={record.quantity}
                    disabled={actionLoading.modify[record.ProductId]}
                    onChange={(e) =>
                      updateQuantity(record.ProductId, Math.max(0, parseInt(e.target.value || "0")))
                    }
                  />
                </div>
              ),
            },
            {
              title: "عملیات",
              key: "actions",
              render: (_: any, record: WarehouseProduct) => (
                <Button
                  danger
                  loading={actionLoading.remove[record.ProductId]}
                  onClick={() => removeProduct(record.ProductId)}
                  className="flex items-center gap-2"
                >
                  حذف
                </Button>
              ),
            },
          ]}
        />
      </Modal>
      <Styles />
    </div>
  );
}
