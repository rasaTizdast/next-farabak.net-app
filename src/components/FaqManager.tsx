"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { BiTrash, BiEdit, BiPlus, BiCheck, BiX, BiMenu } from "react-icons/bi";

import { formatJalaliDate } from "@/utils/jalaliDate";

interface FaqItem {
  id?: number;
  question: string;
  answer: string;
  order: number;
  available: boolean;
  created_at?: string;
  updated_at?: string;
}

interface FaqManagerProps {
  blogId: number | null;
  onClose: () => void;
}

const FaqManager: React.FC<FaqManagerProps> = ({ blogId, onClose }) => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingFaq, setEditingFaq] = useState<number | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [newFaq, setNewFaq] = useState<FaqItem>({
    question: "",
    answer: "",
    order: 0,
    available: true,
  });

  useEffect(() => {
    if (blogId) {
      fetchFaqs();
    }
  }, [blogId]);

  const fetchFaqs = async () => {
    if (!blogId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/blogs/manage/${blogId}/faqs`);
      if (response.ok) {
        const data = await response.json();
        console.log(
          "Fetched FAQs from database:",
          data.faqs?.map((f: any) => ({
            id: f.id,
            order: f.order,
            question: f.question.substring(0, 30) + "...",
          }))
        );
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      toast.error("خطا در بارگذاری سوالات متداول");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddFaq = async () => {
    if (!blogId) {
      toast.error("شناسه بلاگ موجود نیست");
      return;
    }

    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error("سوال و پاسخ الزامی است");
      return;
    }

    // Calculate the next order value - get the maximum order from current FAQs
    const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((faq) => faq.order || 0)) : -1;
    const nextOrder = maxOrder + 1;
    console.log(
      "Creating new FAQ with order:",
      nextOrder,
      "Max order in current FAQs:",
      maxOrder,
      "Current FAQs:",
      faqs.map((f) => ({ id: f.id, order: f.order }))
    );

    try {
      const response = await fetch(`/api/blogs/manage/${blogId}/faqs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newFaq,
          order: nextOrder,
        }),
      });

      if (response.ok) {
        // Refresh the FAQs list to ensure correct order
        await fetchFaqs();
        setNewFaq({ question: "", answer: "", order: 0, available: true });
        toast.success("سوال متداول با موفقیت اضافه شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "خطا در اضافه کردن سوال");
      }
    } catch (error) {
      console.error("Error adding FAQ:", error);
      toast.error("خطا در اضافه کردن سوال متداول");
    }
  };

  const handleUpdateFaq = async (faqId: number, updatedFaq: FaqItem) => {
    try {
      const response = await fetch(`/api/blogs/faqs/${faqId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFaq),
      });

      if (response.ok) {
        const data = await response.json();
        setFaqs(faqs.map((faq) => (faq.id === faqId ? data.faq : faq)));
        setEditingFaq(null);
        toast.success("سوال متداول با موفقیت بروزرسانی شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "خطا در بروزرسانی سوال");
      }
    } catch (error) {
      console.error("Error updating FAQ:", error);
      toast.error("خطا در بروزرسانی سوال متداول");
    }
  };

  const handleDeleteFaq = async (faqId: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این سوال را حذف کنید؟")) {
      return;
    }

    try {
      const response = await fetch(`/api/blogs/faqs/${faqId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setFaqs(faqs.filter((faq) => faq.id !== faqId));
        toast.success("سوال متداول با موفقیت حذف شد");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "خطا در حذف سوال");
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      toast.error("خطا در حذف سوال متداول");
    }
  };

  const handleDragStart = (e: React.DragEvent, faqId: number) => {
    setDraggedItem(faqId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetFaqId: number) => {
    e.preventDefault();

    if (!draggedItem || draggedItem === targetFaqId) {
      setDraggedItem(null);
      return;
    }

    const draggedIndex = faqs.findIndex((faq) => faq.id === draggedItem);
    const targetIndex = faqs.findIndex((faq) => faq.id === targetFaqId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedItem(null);
      return;
    }

    // Create new array with reordered items
    const newFaqs = [...faqs];
    const [movedFaq] = newFaqs.splice(draggedIndex, 1);
    newFaqs.splice(targetIndex, 0, movedFaq);

    // Update order values
    const updatedFaqs = newFaqs.map((faq, index) => ({
      ...faq,
      order: index,
    }));

    console.log("Reordering FAQs:", {
      draggedItem,
      targetFaqId,
      oldOrder: faqs.map((f) => ({ id: f.id, order: f.order })),
      newOrder: updatedFaqs.map((f) => ({ id: f.id, order: f.order })),
    });

    // Update UI immediately
    setFaqs(updatedFaqs);

    // Update order in database - update all FAQs that have changed order
    try {
      // Find all FAQs that have different order values
      const faqsToUpdate = updatedFaqs.filter((updatedFaq) => {
        const originalFaq = faqs.find((f) => f.id === updatedFaq.id);
        return originalFaq && originalFaq.order !== updatedFaq.order;
      });

      console.log(
        "Updating order for FAQs:",
        faqsToUpdate.map((f) => ({
          id: f.id,
          oldOrder: faqs.find((orig) => orig.id === f.id)?.order,
          newOrder: f.order,
        }))
      );

      // Update all changed FAQs
      await Promise.all(
        faqsToUpdate.map(async (faq) => {
          if (faq.id) {
            const response = await fetch(`/api/blogs/faqs/${faq.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ order: faq.order }),
            });

            if (!response.ok) {
              throw new Error(`Failed to update FAQ ${faq.id} order`);
            }
          }
        })
      );

      // Refresh the FAQs from database to ensure consistency
      await fetchFaqs();
      toast.success("ترتیب سوالات با موفقیت تغییر کرد");
    } catch (error) {
      console.error("Error updating FAQ order:", error);
      toast.error("خطا در تغییر ترتیب سوالات");
      // Revert the UI change on error
      setFaqs(faqs);
    }

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg bg-gray-800 p-6 text-gray-200 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">مدیریت سوالات متداول</h2>
          <button onClick={onClose} className="text-gray-400 transition-colors hover:text-gray-200">
            ✕
          </button>
        </div>

        {/* Add New FAQ Form */}
        <div className="mb-6 rounded-lg bg-gray-700 p-4">
          <h3 className="mb-4 text-lg font-semibold">افزودن سوال جدید</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">سوال</label>
              <input
                type="text"
                value={newFaq.question}
                onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                placeholder="سوال خود را وارد کنید..."
                className="w-full rounded-lg border border-gray-600 bg-gray-600 px-4 py-2 focus:border-blue-500 focus:outline-none"
                maxLength={400}
              />
              <span className="text-xs text-gray-400">{newFaq.question.length}/400 کاراکتر</span>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">پاسخ</label>
              <textarea
                value={newFaq.answer}
                onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                placeholder="پاسخ خود را وارد کنید..."
                className="h-24 w-full rounded-lg border border-gray-600 bg-gray-600 px-4 py-2 focus:border-blue-500 focus:outline-none"
                maxLength={1500}
              />
              <span className="text-xs text-gray-400">{newFaq.answer.length}/1500 کاراکتر</span>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newFaq.available}
                  onChange={(e) => setNewFaq({ ...newFaq, available: e.target.checked })}
                  className="rounded border-gray-600 bg-gray-600"
                />
                <span className="text-sm">فعال</span>
              </label>
              <button
                onClick={handleAddFaq}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <BiPlus size={16} />
                افزودن سوال
              </button>
            </div>
          </div>
        </div>

        {/* FAQs List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">سوالات موجود</h3>
            <div className="text-sm text-gray-400">
              <BiMenu size={16} className="ml-1 inline" />
              برای تغییر ترتیب، آیتم‌ها را بکشید و رها کنید
            </div>
          </div>
          {isLoading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
              <p className="mt-2 text-gray-400">در حال بارگذاری...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="rounded-lg bg-gray-700 p-8 text-center">
              <p className="text-gray-400">هیچ سوال متداولی وجود ندارد</p>
            </div>
          ) : (
            faqs
              .toSorted((a, b) => a.order - b.order)
              .map((faq, index) => (
                <div
                  key={faq.id || index}
                  className={`cursor-move rounded-lg bg-gray-700 p-4 transition-all duration-200 ${
                    draggedItem === faq.id
                      ? "scale-95 opacity-50 shadow-lg"
                      : "hover:bg-gray-600 hover:shadow-md"
                  } ${editingFaq === faq.id ? "cursor-default" : ""}`}
                  draggable={editingFaq !== faq.id}
                  onDragStart={(e) => handleDragStart(e, faq.id!)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, faq.id!)}
                  onDragEnd={handleDragEnd}
                >
                  {editingFaq === faq.id ? (
                    <EditFaqForm
                      faq={faq}
                      onSave={(updatedFaq) => handleUpdateFaq(faq.id!, updatedFaq)}
                      onCancel={() => setEditingFaq(null)}
                    />
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex flex-1 items-start gap-3">
                        {/* Drag Handle */}
                        <div className="mt-1 flex flex-col items-center gap-1">
                          <BiMenu
                            size={20}
                            className="cursor-move text-gray-400 transition-colors hover:text-gray-200"
                          />
                          <span className="text-xs text-gray-400">کشیدن</span>
                        </div>

                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <span className="rounded bg-blue-600 px-2 py-1 text-xs text-white">
                              {faq.order + 1}
                            </span>
                            {!faq.available && (
                              <span className="rounded bg-red-600 px-2 py-1 text-xs text-white">
                                غیرفعال
                              </span>
                            )}
                          </div>
                          <h4 className="mb-2 font-semibold text-gray-200">{faq.question}</h4>
                          <p className="text-sm text-gray-300">{faq.answer}</p>
                          {(faq.created_at || faq.updated_at) && (
                            <div className="mt-2 text-xs text-gray-400">
                              {faq.created_at && (
                                <span>ایجاد: {formatJalaliDate(faq.created_at)}</span>
                              )}
                              {faq.created_at &&
                                faq.updated_at &&
                                faq.created_at !== faq.updated_at && (
                                  <span className="mx-2">•</span>
                                )}
                              {faq.updated_at && faq.created_at !== faq.updated_at && (
                                <span>بروزرسانی: {formatJalaliDate(faq.updated_at)}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => setEditingFaq(faq.id!)}
                          className="rounded bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
                          title="ویرایش"
                        >
                          <BiEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteFaq(faq.id!)}
                          className="rounded bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
                          title="حذف"
                        >
                          <BiTrash size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit FAQ Form Component
interface EditFaqFormProps {
  faq: FaqItem;
  onSave: (faq: FaqItem) => void;
  onCancel: () => void;
}

const EditFaqForm: React.FC<EditFaqFormProps> = ({ faq, onSave, onCancel }) => {
  const [editedFaq, setEditedFaq] = useState<FaqItem>(() => faq);

  const handleSave = () => {
    if (!editedFaq.question.trim() || !editedFaq.answer.trim()) {
      toast.error("سوال و پاسخ الزامی است");
      return;
    }
    onSave(editedFaq);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">سوال</label>
        <input
          type="text"
          value={editedFaq.question}
          onChange={(e) => setEditedFaq({ ...editedFaq, question: e.target.value })}
          className="w-full rounded-lg border border-gray-600 bg-gray-600 px-4 py-2 focus:border-blue-500 focus:outline-none"
          maxLength={400}
        />
        <span className="text-xs text-gray-400">{editedFaq.question.length}/400 کاراکتر</span>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">پاسخ</label>
        <textarea
          value={editedFaq.answer}
          onChange={(e) => setEditedFaq({ ...editedFaq, answer: e.target.value })}
          className="h-24 w-full rounded-lg border border-gray-600 bg-gray-600 px-4 py-2 focus:border-blue-500 focus:outline-none"
          maxLength={1500}
        />
        <span className="text-xs text-gray-400">{editedFaq.answer.length}/1500 کاراکتر</span>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={editedFaq.available}
            onChange={(e) => setEditedFaq({ ...editedFaq, available: e.target.checked })}
            className="rounded border-gray-600 bg-gray-600"
          />
          <span className="text-sm">فعال</span>
        </label>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded bg-green-600 px-3 py-1 text-white transition-colors hover:bg-green-700"
          >
            <BiCheck size={16} />
            ذخیره
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 rounded bg-gray-600 px-3 py-1 text-white transition-colors hover:bg-gray-700"
          >
            <BiX size={16} />
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqManager;
