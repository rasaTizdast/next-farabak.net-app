import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FaTimes } from "react-icons/fa";

import { useApiMutation } from "@/hooks/useApiMutation";
import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

import { Product } from "../types";
import GradeList from "./GradeList";

type Props = {
  product: Product;
  onClose: () => void;
  refetchProducts: () => void;
};

type GradeForm = {
  grade: string;
  price: number;
  discount: number;
};

const ProductGradeModal = ({ product, onClose, refetchProducts }: Props) => {
  const [formData, setFormData] = useState<GradeForm>({
    grade: "",
    price: 0,
    discount: 0,
  });
  const { mutate: addGrade, loading: isSubmitting } = useApiMutation("post");
  const [usdRate, setUsdRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const rate = await fetchUsdToRialRate();
        setUsdRate(rate);
      } catch (error) {
        console.error("Failed to fetch USD rate:", error);
        setUsdRate(null);
      }
    };
    fetchExchangeRate();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "grade") {
      // Only allow English letters
      if (/^[A-Za-z]*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.grade || !formData.price || formData.price <= 0) {
      toast.error("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    const res = await addGrade("/api/products/grades", {
      productId: product.ProductId,
      grade: formData.grade,
      price: Number(formData.price),
      discount: Number(formData.discount),
    });

    if (res) {
      toast.success("گرید محصول با موفقیت اضافه شد");
      setFormData({ grade: "", price: 0, discount: 0 });
      refetchProducts();
    }
  };

  const isValidRate = usdRate && !isNaN(usdRate) && usdRate > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="min-w-[450px] rounded-lg bg-slate-800 p-6 text-white shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">مدیریت گرید‌های محصول</h3>
          <button type="button"
            onClick={onClose}
            className="rounded-full bg-slate-700 p-2 transition-colors hover:bg-slate-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Product Info */}
        <div className="mb-6 rounded-lg bg-slate-700/50 p-4">
          <h4 className="mb-3 text-lg font-semibold">{product.Type}</h4>
          <div className="grid gap-3">
            {!isValidRate ? (
              <>
                <div className="space-y-2">
                  <div className="h-6 w-32 animate-pulse rounded-md bg-slate-600" />
                  <div className="h-7 w-full animate-pulse rounded-md bg-slate-600" />
                </div>
                {product.Discount && Number(product.Discount) > 0 && (
                  <div className="space-y-2">
                    <div className="h-6 w-32 animate-pulse rounded-md bg-slate-600" />
                    <div className="h-7 w-full animate-pulse rounded-md bg-slate-600" />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between rounded-md bg-slate-700 p-3">
                  <span className="text-gray-300">قیمت اصلی:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      ${Number(product.Price).toFixed(2)}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="font-medium text-white">
                      {(Number(product.Price) * usdRate!).toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                </div>
                {product.Discount && Number(product.Discount) > 0 && (
                  <div className="flex items-center justify-between rounded-md bg-slate-700 p-3">
                    <span className="text-gray-300">تخفیف:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        ${Number(product.Discount).toFixed(2)}
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="font-medium text-white">
                        {(Number(product.Discount) * usdRate!).toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Grade Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="mb-2 block text-sm text-gray-300">
                گرید (فقط حروف انگلیسی مجاز است)
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                maxLength={1}
                className="w-full rounded-md border border-slate-600 bg-slate-700/50 p-3 text-white transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="مثال: A"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">قیمت (دلار)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full rounded-md border border-slate-600 bg-slate-700/50 p-3 text-white transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {isValidRate && formData.price > 0 && (
                <span className="mt-2 block text-sm text-gray-400">
                  معادل {(Number(formData.price) * usdRate!).toLocaleString("fa-IR")} تومان
                </span>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">تخفیف (دلار)</label>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full rounded-md border border-slate-600 bg-slate-700/50 p-3 text-white transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {isValidRate && formData.discount > 0 && (
                <span className="mt-2 block text-sm text-gray-400">
                  معادل {(Number(formData.discount) * usdRate!).toLocaleString("fa-IR")} تومان
                </span>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 p-3 font-medium text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "در حال ثبت..." : "افزودن گرید"}
          </button>
        </form>

        {/* List of existing grades */}
        <GradeList productId={product.ProductId} refetchProducts={refetchProducts} />
      </div>
    </div>
  );
};

export default ProductGradeModal;
