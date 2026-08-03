"use client";

import { useState } from "react";

interface BlogFormData {
  title: string;
  slug: string;
  content: string;
  category?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

interface BlogFormProps {
  mode: "create" | "edit";
  initialData?: BlogFormData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function BlogForm({ mode, initialData, onSuccess, onCancel }: BlogFormProps) {
  const [formData, setFormData] = useState<BlogFormData>(
    initialData || {
      title: "",
      slug: "",
      content: "",
      category: "",
      metaDescription: "",
      metaKeywords: "",
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">عنوان</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">slug</label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">دسته‌بندی</label>
        <input
          type="text"
          value={formData.category || ""}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>
      <div className="flex gap-4">
        <button
          type="submit"
          className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-secondary"
        >
          {mode === "create" ? "ایجاد" : "بروزرسانی"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
          >
            انصراف
          </button>
        )}
      </div>
    </form>
  );
}
