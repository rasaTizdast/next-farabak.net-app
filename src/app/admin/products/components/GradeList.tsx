import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";

import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

import GradeCardSkeleton from "./GradeCardSkeleton";

type Grade = {
  ProductGradeId: number;
  ProductId: number;
  Grade: string;
  Price: number;
  discount: number;
};

type Props = {
  productId: number;
  refetchProducts: () => void;
};

type EditingGrade = {
  id: number;
  grade: string;
  price: number;
  discount: number;
} | null;

const GradeList = ({ productId, refetchProducts }: Props) => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGrade, setEditingGrade] = useState<EditingGrade>(null);
  const [usdRate, setUsdRate] = useState<number | null>(null);

  const fetchGrades = async () => {
    try {
      const response = await axios.get(`/api/products/grades?productId=${productId}`);
      setGrades(response.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("خطا در دریافت لیست گرید‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [productId]);

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

  const handleDelete = async (gradeId: number) => {
    if (!confirm("آیا از حذف این گرید اطمینان دارید؟")) return;

    try {
      await axios.delete(`/api/products/grades/grade/${gradeId}`);
      toast.success("گرید با موفقیت حذف شد");
      fetchGrades();
      refetchProducts();
    } catch (error) {
      console.error("Error deleting grade:", error);
      toast.error("خطا در حذف گرید");
    }
  };

  const handleEdit = async (grade: Grade) => {
    setEditingGrade({
      id: grade.ProductGradeId,
      grade: grade.Grade,
      price: grade.Price,
      discount: grade.discount,
    });
  };

  const handleUpdate = async () => {
    if (!editingGrade) return;

    try {
      if (!editingGrade.grade || editingGrade.price <= 0) {
        toast.error("لطفاً تمام فیلدها را پر کنید");
        return;
      }

      await axios.put(`/api/products/grades/grade/${editingGrade.id}`, {
        grade: editingGrade.grade,
        price: editingGrade.price,
        discount: editingGrade.discount,
      });

      toast.success("گرید با موفقیت بروزرسانی شد");
      setEditingGrade(null);
      fetchGrades();
      refetchProducts();
    } catch (error) {
      console.error("Error updating grade:", error);
      toast.error("خطا در بروزرسانی گرید");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingGrade) return;

    const { name, value } = e.target;

    if (name === "grade") {
      // Only allow English letters
      if (/^[A-Za-z]*$/.test(value)) {
        setEditingGrade({ ...editingGrade, grade: value.toUpperCase() });
      }
    } else {
      setEditingGrade({ ...editingGrade, [name]: value });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <GradeCardSkeleton />
        <GradeCardSkeleton />
      </div>
    );
  }

  const isValidRate = usdRate && !isNaN(usdRate) && usdRate > 0;

  return (
    <div className="rounded-lg bg-slate-700/50 p-4">
      <h4 className="mb-4 text-lg font-semibold text-white">گرید‌های موجود</h4>
      {grades.length === 0 ? (
        <div className="flex h-20 items-center justify-center rounded-md bg-slate-700 text-gray-400">
          هیچ گرید‌ای ثبت نشده است
        </div>
      ) : (
        <div className="space-y-3">
          {grades.map((grade) => (
            <div
              key={grade.ProductGradeId}
              className="overflow-hidden rounded-lg bg-slate-700 shadow-sm transition-all hover:shadow-md"
            >
              {editingGrade?.id === grade.ProductGradeId ? (
                <div className="p-3">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm text-gray-300">
                        گرید (فقط حروف انگلیسی مجاز است)
                      </label>
                      <input
                        type="text"
                        name="grade"
                        value={editingGrade.grade}
                        onChange={handleInputChange}
                        maxLength={1}
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 p-3 text-white transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-300">قیمت (دلار)</label>
                      <input
                        type="number"
                        name="price"
                        value={editingGrade.price}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 p-3 text-white transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      {isValidRate && editingGrade.price > 0 && (
                        <div className="mt-2 flex items-center justify-between rounded-md bg-slate-600/50 p-3">
                          <span className="text-sm text-gray-300">معادل:</span>
                          <span className="font-medium text-white">
                            {(editingGrade.price * usdRate!).toLocaleString("fa-IR")} تومان
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-gray-300">تخفیف (دلار)</label>
                      <input
                        type="number"
                        name="discount"
                        value={editingGrade.discount}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full rounded-md border border-slate-600 bg-slate-700/50 p-3 text-white transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                      {isValidRate && editingGrade.discount > 0 && (
                        <div className="space-y-2 pt-2">
                          <div className="flex items-center justify-between rounded-md bg-slate-600/50 p-3">
                            <span className="text-sm text-gray-300">معادل:</span>
                            <span className="font-medium text-white">
                              {(editingGrade.discount * usdRate!).toLocaleString("fa-IR")} تومان
                            </span>
                          </div>

                          {/* Final Price */}
                          <div className="flex items-center justify-between rounded-md bg-green-500/10 p-3">
                            <span className="text-sm text-green-400">قیمت نهایی:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-white">
                                $
                                {(editingGrade.price - editingGrade.discount).toLocaleString(
                                  "en-US"
                                )}
                              </span>
                              <span className="text-gray-400">/</span>
                              <span className="font-medium text-white">
                                {(
                                  (editingGrade.price - editingGrade.discount) *
                                  usdRate!
                                ).toLocaleString("fa-IR")}{" "}
                                تومان
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleUpdate}
                        className="flex-1 rounded-md bg-green-600 p-3 font-medium text-white transition-all hover:bg-green-700"
                      >
                        ذخیره تغییرات
                      </button>
                      <button
                        onClick={() => setEditingGrade(null)}
                        className="flex-1 rounded-md bg-slate-600 p-3 font-medium text-white transition-all hover:bg-slate-700"
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between border-b border-slate-600 p-3">
                    <span className="text-xl font-semibold text-white">گرید {grade.Grade}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(grade)}
                        className="rounded-md bg-blue-500/20 p-2 text-blue-400 transition-all hover:bg-blue-500/30"
                        title="ویرایش"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(grade.ProductGradeId)}
                        className="rounded-md bg-red-500/20 p-2 text-red-400 transition-all hover:bg-red-500/30"
                        title="حذف"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 p-3">
                    {/* Original Price */}
                    <div className="flex items-center justify-between rounded-md bg-slate-600/50 p-3">
                      <span className="text-sm text-blue-400">قیمت اصلی:</span>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-white">
                          ${grade.Price.toLocaleString("en-US")}
                        </span>
                        <span className="text-gray-400">/</span>
                        <span className="font-medium text-white">
                          {isValidRate
                            ? (grade.Price * usdRate!).toLocaleString("fa-IR") + " تومان"
                            : "خطا در دریافت نرخ ارز"}
                        </span>
                      </div>
                    </div>

                    {/* Discount */}
                    {grade.discount > 0 && (
                      <>
                        <div className="flex items-center justify-between rounded-md bg-slate-600/50 p-3">
                          <span className="text-sm text-red-400">تخفیف:</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-white">
                              ${grade.discount.toLocaleString("en-US")}
                            </span>
                            <span className="text-gray-400">/</span>
                            <span className="font-medium text-white">
                              {isValidRate
                                ? (grade.discount * usdRate!).toLocaleString("fa-IR") + " تومان"
                                : "خطا در دریافت نرخ ارز"}
                            </span>
                          </div>
                        </div>

                        {/* Final Price */}
                        <div className="flex items-center justify-between rounded-md bg-green-500/10 p-3">
                          <span className="text-sm text-green-400">قیمت نهایی:</span>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-medium text-white">
                              ${(grade.Price - grade.discount).toLocaleString("en-US")}
                            </span>
                            <span className="text-gray-400">/</span>
                            <span className="font-medium text-white">
                              {isValidRate
                                ? ((grade.Price - grade.discount) * usdRate!).toLocaleString(
                                    "fa-IR"
                                  ) + " تومان"
                                : "خطا در دریافت نرخ ارز"}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GradeList;
