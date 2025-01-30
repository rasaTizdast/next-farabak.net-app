// src/components/NewBlog.tsx
"use client";

import { useState } from "react";
import TipTapBlogEditor from "../tiptapEditor/TipTapEditor";

interface BlogFormData {
  title: string;
  SEO_Title: string;
  slug: string;
  author: string;
  SEO_description: string;
  image_URL: string;
  image_alt: string;
  categories: string[];
}

const NewBlog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [blogId, setBlogId] = useState<number | null>(null);
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    SEO_Title: "",
    slug: "",
    author: "",
    SEO_description: "",
    image_URL: "",
    image_alt: "",
    categories: [],
  });

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/blogs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("خطا در ایجاد وبلاگ");

      const data = await response.json();
      setBlogId(data.id);
      setStep(2);
    } catch (error) {
      console.error("Error:", error);
      alert("خطا در ایجاد وبلاگ. لطفا دوباره تلاش کنید.");
    }
  };

  const handleEditorSave = async (
    content: string,
    publish: boolean = false
  ) => {
    try {
      const response = await fetch(`/api/blogs/update/${blogId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          status: publish ? "Published" : "Draft",
        }),
      });

      if (!response.ok) throw new Error("خطا در بروزرسانی وبلاگ");

      alert(
        publish ? "وبلاگ با موفقیت منتشر شد" : "پیش‌نویس با موفقیت ذخیره شد"
      );
      onClose();
    } catch (error) {
      console.error("Error:", error);
      alert("خطا در بروزرسانی وبلاگ. لطفا دوباره تلاش کنید.");
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-auto">
        {step === 1 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">ایجاد وبلاگ جدید</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    عنوان وبلاگ
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        title: e.target.value,
                        slug: generateSlug(e.target.value),
                      });
                    }}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    عنوان SEO
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={70}
                    value={formData.SEO_Title}
                    onChange={(e) =>
                      setFormData({ ...formData, SEO_Title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs text-gray-400">
                    {formData.SEO_Title.length}/70 کاراکتر
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    نویسنده
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    اسلاگ
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    توضیحات SEO
                  </label>
                  <textarea
                    required
                    maxLength={165}
                    value={formData.SEO_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        SEO_description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 h-24"
                  />
                  <span className="text-xs text-gray-400">
                    {formData.SEO_description.length}/165 کاراکتر
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    آدرس تصویر شاخص
                  </label>
                  <input
                    type="url"
                    value={formData.image_URL}
                    onChange={(e) =>
                      setFormData({ ...formData, image_URL: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    متن جایگزین تصویر
                  </label>
                  <input
                    type="text"
                    value={formData.image_alt}
                    onChange={(e) =>
                      setFormData({ ...formData, image_alt: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  ادامه
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">نوشتن محتوای وبلاگ</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1">
              <TipTapBlogEditor
                onSave={(content) => handleEditorSave(content)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBlog;
