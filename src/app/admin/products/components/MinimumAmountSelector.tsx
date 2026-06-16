import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaTimes } from "react-icons/fa";
import { TbShoppingCartCog } from "react-icons/tb";

import { useApiMutation } from "@/hooks/useApiMutation";
import { Product } from "../types";

type ButtonProps = {
  product: Product;
  refetchProducts: () => void;
};

type ModalProps = {
  product: Product;
  onClose: () => void;
  refetchProducts: () => void;
};

const MinimumAmountSelector = ({ product, refetchProducts }: ButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`rounded-lg p-2 transition-all ${product.Minimum_Amount || product.Maximum_Amount ? "bg-orange-700 ring-2 ring-orange-300 hover:bg-orange-800" : "bg-orange-700 hover:bg-orange-800"}`}
        title="محدودیت‌ مقدار‌ محصول"
      >
        <TbShoppingCartCog size={23} color="#fff" />
      </button>

      {isModalOpen && (
        <MinimumAmountSelectorModal
          product={product}
          onClose={() => setIsModalOpen(false)}
          refetchProducts={refetchProducts}
        />
      )}
    </>
  );
};
export default MinimumAmountSelector;

const MinimumAmountSelectorModal = ({ product, onClose, refetchProducts }: ModalProps) => {
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const { mutate: saveLimits, loading: isLoading } = useApiMutation("patch");

  // Initialize with existing values
  useEffect(() => {
    setMinAmount(product.Minimum_Amount?.toString() || "");
    setMaxAmount(product.Maximum_Amount?.toString() || "");
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const min = minAmount ? parseFloat(minAmount) : null;
    const max = maxAmount ? parseFloat(maxAmount) : null;

    if (min !== null && min < 0) {
      toast.error("حداقل مقدار نمی‌تواند منفی باشد");
      return;
    }

    if (max !== null && max < 0) {
      toast.error("حداکثر مقدار نمی‌تواند منفی باشد");
      return;
    }

    if (min !== null && max !== null && min > max) {
      toast.error("حداقل مقدار نمی‌تواند بیشتر از حداکثر باشد");
      return;
    }

    const res = await saveLimits(`/api/admin/products/${product.ProductId}/amount-limits`, {
      minimum_amount: min,
      maximum_amount: max,
    });

    if (res) {
      toast.success("تغییرات با موفقیت ذخیره شد");
      refetchProducts();
      onClose();
    }
  };

  const handleClear = () => {
    setMinAmount("");
    setMaxAmount("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4 backdrop-blur-sm">
      <div className="min-w-[450px] rounded-lg bg-slate-800 p-6 text-white shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-bold">محدودیت مقدار محصول</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-700 p-2 transition-colors hover:bg-slate-600"
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-4 rounded-lg bg-slate-700 p-3">
          <p className="text-sm text-slate-300">
            محصول: <span className="font-semibold text-white">{product.Type}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="my-4 flex flex-col gap-5">
            <div>
              <label htmlFor="min-amount" className="mb-2 block text-right text-sm font-medium">
                حداقل مقدار
              </label>
              <input
                id="min-amount"
                type="number"
                step="0.01"
                min="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="بدون محدودیت"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-slate-400">برای حذف محدودیت، فیلد را خالی بگذارید</p>
            </div>

            <div>
              <label htmlFor="max-amount" className="mb-2 block text-right text-sm font-medium">
                حداکثر مقدار
              </label>
              <input
                id="max-amount"
                type="number"
                step="0.01"
                min="0"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="بدون محدودیت"
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-2 text-sm text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-slate-400">برای حذف محدودیت، فیلد را خالی بگذارید</p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-blue-700 p-2 transition-all hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="rounded-lg bg-slate-700 px-4 transition-all hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              پاک کردن
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
