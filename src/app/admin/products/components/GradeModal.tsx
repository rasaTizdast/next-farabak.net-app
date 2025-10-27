import axios from "axios";
import React, { useState } from "react";
import { toast } from "react-hot-toast";

import { Product } from "../types";
import { createGradeImages } from "../utils/gradeImages";

interface ImageResult {
  error?: string;
  img1?: string;
  img2?: string;
}

type Props = {
  product: Product | null;
  onClose: () => void;
  refetchProducts: () => void;
};

const GradeModal = ({ product, onClose, refetchProducts }: Props) => {
  const [grade, setGrade] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
    if (!grade.trim() || !price.trim() || !discount.trim()) {
      setError("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    setIsLoading(true);
    setError("");
    setProgress(0);

    try {
      // Step 1: Create grade variant
      setProgress(20);
      const gradeResponse = await axios.post("/api/admin/products/create-grade", {
        productId: product?.ProductId,
        grade: grade.trim(),
        price: price || undefined,
        discount: discount || undefined,
      });

      if (!gradeResponse.data?.ProductId) {
        throw new Error("Failed to create grade variant");
      }

      setProgress(50);

      // Step 2: Copy and rename images
      if (product?.img1?.name || product?.img2?.name) {
        const imageResult: ImageResult = await createGradeImages(
          product.Slug,
          grade.trim(),
          product.img1?.name || undefined,
          product.img2?.name || undefined
        );

        if (imageResult.error) {
          throw new Error(imageResult.error);
        }

        setProgress(80);

        // Step 3: Update the product with new image keys if images were copied
        if (imageResult.img1 || imageResult.img2) {
          await axios.patch(`/api/admin/products/${gradeResponse.data.ProductId}/updateImages`, {
            img1: imageResult.img1,
            img2: imageResult.img2,
          });
        }
      }

      setProgress(100);
      toast.success("گرید جدید با موفقیت ایجاد شد");
      refetchProducts();
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.error || "خطا در ایجاد گرید محصول");
        console.error("Axios error:", error.response?.data);
      } else {
        setError("خطای غیر منتظره در ایجاد گرید محصول");
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="w-11/12 max-w-md rounded-lg bg-gray-800 p-6">
        <h3 className="mb-4 text-xl font-semibold text-white">
          ایجاد گرید جدید برای محصول: {product.Type}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="grade" className="text-sm text-gray-300">
                گرید محصول
              </label>
              <span className="text-xs text-red-500">* ضروری</span>
            </div>
            <input
              type="text"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="مثال: A یا B یا C"
              required
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="price" className="text-sm text-gray-300">
                قیمت جدید
              </label>
              <span className="text-xs text-red-500">* ضروری</span>
            </div>
            <div className="relative">
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 pr-32 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="قیمت گرید جدید"
                required
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-sm text-gray-400">اصلی: {product?.Price || "ندارد"}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="discount" className="text-sm text-gray-300">
                تخفیف جدید
              </label>
              <span className="text-xs text-red-500">* ضروری</span>
            </div>
            <div className="relative">
              <input
                type="number"
                id="discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 pr-32 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="تخفیف گرید جدید"
                required
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-sm text-gray-400">
                  اصلی: {product?.Discount || "ندارد"}
                </span>
              </div>
            </div>
          </div>

          {error && <div className="rounded-lg bg-red-600 p-2 text-sm text-white">{error}</div>}

          {isLoading && (
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-all hover:bg-gray-700"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? `در حال ایجاد... ${progress}%` : "ایجاد گرید"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GradeModal;
