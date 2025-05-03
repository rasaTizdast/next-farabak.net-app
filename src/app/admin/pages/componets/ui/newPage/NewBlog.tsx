// src/components/NewBlog.tsx
"use client";

import { useEffect, useState } from "react";
import TipTapBlogEditor from "../blogEditor/TipTapEditor";
import { BiTrash } from "react-icons/bi";
import toast from "react-hot-toast";

interface BlogFormData {
  title: string;
  SEO_Title: string;
  slug: string;
  author: string;
  SEO_description: string;
  image_alt: string;
  categories: number[];
  image_URL?: string; // Make optional since it will be added after upload
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const NewBlog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [blogId, setBlogId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Add these state variables at the top of the component
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
  });

  // Add a new state for confirmation modal
  const [confirmationModalData, setConfirmationModalData] = useState<{
    categoryId: number;
    categoryName: string;
    blogs: Array<{ id: number; title: string }>;
  } | null>(null);

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

  // Add image handler functions
  // Update the handleImageUpload function
  const handleImageUpload = async (file: File) => {
    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("slug", formData.slug); // Send current slug

      const response = await fetch("/api/manageBlog/upload", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if slug is available
    if (!formData.slug) {
      setUploadError("لطفا ابتدا عنوان وبلاگ را وارد کنید");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("حجم فایل نباید بیشتر از ۲ مگابایت باشد");
      return;
    }

    setUploadError(null);
    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const validateForm = () => {
    const errors: string[] = []; // Explicitly type as string array
    const requiredFields = [
      { field: formData.title, name: "عنوان وبلاگ" },
      { field: formData.SEO_Title, name: "عنوان SEO" },
      { field: formData.author, name: "نویسنده" },
      { field: formData.slug, name: "شناسه" },
      { field: formData.SEO_description, name: "توضیحات SEO" },
      { field: formData.image_alt, name: "متن جایگزین تصویر" },
    ];

    requiredFields.forEach(({ field, name }) => {
      if (!field.trim()) errors.push(`${name} الزامی است`);
    });

    // Add slug validation
    if (formData.slug && !/^[a-z0-9\-_]+$/.test(formData.slug)) {
      errors.push("شناسه فقط می‌تواند شامل حروف انگلیسی، اعداد، خط تیره و زیرخط باشد");
    }

    if (formData.categories.length === 0) {
      errors.push("حداقل یک دسته بندی انتخاب کنید");
    }

    if (uploadError) errors.push(uploadError);

    setFormErrors(errors);
    return errors.length === 0;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/blogs/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // And in the filtering useEffect:
  useEffect(() => {
    if (categoryInput) {
      // When there's input, filter based on the input
      const filtered = categories.filter((category) =>
        category.name?.toLowerCase().includes(categoryInput.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else if (isInputFocused) {
      // When input is empty but focused, show all categories
      setFilteredCategories(categories);
    } else {
      // When not focused and no input, clear the filtered list
      setFilteredCategories([]);
    }
  }, [categoryInput, categories, isInputFocused]);

  // Add a method to handle forced deletion
  const handleForceCategoryDelete = async () => {
    if (!confirmationModalData) return;

    try {
      const response = await fetch("/api/blogs/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: confirmationModalData.categoryId,
          force: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete category");
      }

      // Remove the category and associated blogs from state
      setCategories((prev) =>
        prev.filter((c) => c.id !== confirmationModalData.categoryId)
      );
      setFormData((prev) => ({
        ...prev,
        categories: prev.categories.filter(
          (id) => id !== confirmationModalData.categoryId
        ),
      }));

      toast.success(
        `دسته بندی و ${confirmationModalData.blogs.length} بلاگ مرتبط با آن حذف شدند`
      );
      setConfirmationModalData(null);
    } catch (error) {
      console.error("Forced delete operation failed:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در حذف دسته بندی"
      );
    }
  };

  // Add these handler functions
  const handleDeleteCategory = async (categoryId: number) => {
    try {
      const response = await fetch("/api/blogs/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: categoryId }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error === "Cannot delete category used in blog posts") {
          // Fetch the blogs using this category
          const blogsResponse = await fetch(
            `/api/blogs/categories/${categoryId}/blogs`
          );
          const blogsUsingCategory = await blogsResponse.json();

          // Open a confirmation modal with blog details
          setConfirmationModalData({
            categoryId,
            categoryName:
              categories.find((c) => c.id === categoryId)?.name || "Category",
            blogs: blogsUsingCategory,
          });
          return;
        }

        // Handle other errors
        console.error("Delete error response:", result);
        throw new Error(result.error || "Failed to delete category");
      }

      // Successful deletion
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setFormData((prev) => ({
        ...prev,
        categories: prev.categories.filter((id) => id !== categoryId),
      }));
      toast.success("دسته بندی با موفقیت حذف شد");
    } catch (error) {
      console.error("Delete operation failed:", error);
      toast.error(
        error instanceof Error ? error.message : "خطا در حذف دسته بندی"
      );
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleCreateCategory = async () => {
    try {
      if (!newCategory.name) {
        throw new Error("نام دسته بندی الزامی است");
      }
      
      if (!newCategory.slug) {
        throw new Error("شناسه دسته بندی الزامی است");
      }
      
      // Validate slug format
      if (!/^[a-z0-9\-_]+$/.test(newCategory.slug)) {
        throw new Error("شناسه فقط می‌تواند شامل حروف انگلیسی، اعداد، خط تیره و زیرخط باشد");
      }

      const response = await fetch("/api/blogs/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در ایجاد دسته بندی");
      }

      const createdCategory = await response.json();
      setCategories((prev) => [...prev, createdCategory]);
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, createdCategory.id],
      }));
      setShowCreateModal(false);
      setNewCategory({ name: "", slug: "" });
      toast.success("دسته بندی با موفقیت ایجاد شد");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "خطا در ایجاد دسته بندی"
      );
    }
  };

  const handleAddCategory = async (category: Category | string) => {
    if (typeof category === "string") {
      try {
        const response = await fetch("/api/blogs/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: category }),
        });

        if (!response.ok) throw new Error("Failed to create category");

        const newCategory = await response.json();
        setCategories((prev) => [...prev, newCategory]);
        setFormData((prev) => ({
          ...prev,
          categories: [...prev.categories, newCategory.id],
        }));
      } catch (error) {
        console.error("Error creating category:", error);
        toast.error("Error creating category. Please try again.");
      }
    } else {
      if (!formData.categories.includes(category.id)) {
        setFormData((prev) => ({
          ...prev,
          categories: [...prev.categories, category.id],
        }));
      }
    }
    setCategoryInput("");
  };

  // Update the handleInitialSubmit function
  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors([]);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = "";
      if (selectedImage) {
        imageUrl = await handleImageUpload(selectedImage);
      }

      const response = await fetch("/api/blogs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_URL: imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در ایجاد وبلاگ");
      }

      const data = await response.json();
      setBlogId(data.id);
      setStep(2);
    } catch (error) {
      console.error("Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "خطا در ایجاد وبلاگ. لطفا دوباره تلاش کنید."
      );
    } finally {
      setIsSubmitting(false);
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

      toast.success(
        publish ? "وبلاگ با موفقیت منتشر شد" : "پیش‌نویس با موفقیت ذخیره شد"
      );
      onClose();
    } catch (error) {
      console.error("Error:", error);
      toast.error("خطا در بروزرسانی وبلاگ. لطفا دوباره تلاش کنید.");
    }
  };

  const generateSlug = (title: string) => {
    // If the input is Persian or doesn't contain valid characters, return empty string
    if (!/[a-zA-Z0-9]/.test(title)) {
      return "";
    }
    
    return (
      title
        // Convert to lowercase
        .toLowerCase()
        // Remove non-alphanumeric characters except spaces, hyphens, and underscores
        .replace(/[^a-z0-9\s\-_]/g, "")
        // Replace multiple spaces with a single space
        .replace(/\s+/g, " ")
        // Replace spaces with hyphens
        .replace(/\s/g, "-")
        // Remove consecutive hyphens
        .replace(/-+/g, "-")
        // Trim leading and trailing spaces and hyphens
        .trim()
        .replace(/^-+|-+$/g, "")
    );
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-gray-800 text-gray-200 p-6 rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-auto">
        {step === 1 ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">ایجاد وبلاگ جدید</h2>
            </div>
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {formErrors.length > 0 && (
                <div className="bg-red-800/30 text-red-400 p-4 rounded-lg">
                  {formErrors.map((error, index) => (
                    <p key={index}>• {error}</p>
                  ))}
                </div>
              )}
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
                    maxLength={60}
                    value={formData.SEO_Title}
                    onChange={(e) =>
                      setFormData({ ...formData, SEO_Title: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs text-gray-400">
                    {formData.SEO_Title.length}/60 کاراکتر
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
                    شناسه (فقط حروف انگلیسی، اعداد، خط تیره و زیرخط)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ 
                        ...formData, 
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, "") 
                      })
                    }
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="مثال: my-blog-post"
                    dir="ltr"
                  />
                  <span className="text-xs text-gray-400">
                    شناسه باید به انگلیسی باشد و فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد، خط تیره و زیرخط باشد
                  </span>
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
                {/* Updated image section */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    تصویر بلاگ
                  </label>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 flex-wrap">
                      <label className="relative cursor-pointer">
                        <span className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-block">
                          انتخاب تصویر
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      {previewImage && (
                        <div className="relative group">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImage(null);
                              setPreviewImage(null);
                              setFormData((prev) => ({
                                ...prev,
                                image_URL: "",
                              }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 text-xs hover:bg-red-700 transition-colors"
                          >
                            <BiTrash size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {uploadError && (
                      <p className="text-red-400 text-sm mt-1">{uploadError}</p>
                    )}

                    <div className="w-full">
                      <input
                        type="text"
                        required
                        placeholder="متن جایگزین تصویر (الزامی)"
                        value={formData.image_alt}
                        disabled={!formData.slug}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            image_alt: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <p className="text-xs text-gray-400">
                      حداکثر حجم فایل: ۲ مگابایت (فرمت‌های مجاز: JPEG, PNG,
                      WEBP)
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  دسته بندی‌ها
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="جستجو یا افزودن دسته بندی..."
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() =>
                      setTimeout(() => setIsInputFocused(false), 200)
                    }
                  />
                  {(isInputFocused || categoryInput) && (
                    <div className="absolute w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg max-h-60 overflow-y-auto z-10">
                      {filteredCategories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between group px-4 py-2 hover:bg-gray-600"
                        >
                          <button
                            type="button"
                            onClick={() => handleAddCategory(category)}
                            className="text-right flex-grow"
                          >
                            {category.name}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(category.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <BiTrash
                              size={20}
                              className="text-red-400 hover:text-red-500 transition-all"
                            />
                          </button>
                        </div>
                      ))}

                      {categoryInput &&
                        !categories.some((c) => c.name === categoryInput) && (
                          <button
                            type="button"
                            onClick={() => {
                              setNewCategory({
                                name: categoryInput,
                                slug: generateSlug(categoryInput),
                              });
                              setShowCreateModal(true);
                            }}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-center"
                          >
                            ایجاد دسته بندی جدید
                          </button>
                        )}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.categories.map((categoryId) => {
                    const category = categories.find(
                      (c) => c.id === categoryId
                    );
                    return (
                      <span
                        key={categoryId}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            categories: prev.categories.filter(
                              (id) => id !== categoryId
                            ),
                          }))
                        }
                        className="bg-green-700 hover:bg-red-600 hover:cursor-pointer px-3 py-1 rounded-lg text-base flex items-center gap-1 transition-all"
                      >
                        {category?.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-400 hover:text-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed relative"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <span className="absolute left-3 top-2.5">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </span>
                  )}
                  {isSubmitting ? "در حال ارسال..." : "ادامه"}
                </button>
              </div>
            </form>
            {showDeleteConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                  <h3 className="text-lg font-bold mb-4">حذف دسته بندی</h3>
                  <p>آیا مطمئن هستید که می‌خواهید این دسته بندی را حذف کنید؟</p>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-4 py-2 text-gray-400 hover:text-gray-200"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(showDeleteConfirm)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showCreateModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                  <h3 className="text-lg font-bold mb-4">
                    ایجاد دسته بندی جدید
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        نام
                      </label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                        placeholder="نام دسته بندی"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        شناسه (فقط حروف انگلیسی، اعداد، خط تیره و زیرخط)
                      </label>
                      <input
                        type="text"
                        value={newCategory.slug}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ""),
                          }))
                        }
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg"
                        placeholder="مثال: my-category-name"
                        dir="ltr"
                      />
                      <span className="text-xs text-gray-400">
                        شناسه باید به انگلیسی باشد و فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد، خط تیره و زیرخط باشد
                      </span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-gray-400 hover:text-gray-200"
                      >
                        انصراف
                      </button>
                      <button
                        onClick={handleCreateCategory}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                        disabled={!newCategory.name || !newCategory.slug || !/^[a-z0-9\-_]+$/.test(newCategory.slug)}
                      >
                        ایجاد
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {confirmationModalData && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                <div className="bg-gray-800 p-6 rounded-lg w-96">
                  <h3 className="text-lg font-bold mb-4">
                    هشدار: دسته بندی در حال استفاده
                  </h3>
                  <p>
                    دسته بندی "{confirmationModalData.categoryName}" در{" "}
                    {confirmationModalData.blogs.length} بلاگ استفاده شده است.
                  </p>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">بلاگ‌های مرتبط:</h4>
                    <ul className="max-h-40 overflow-y-auto bg-gray-700 p-2 rounded-lg">
                      {confirmationModalData.blogs.map((blog) => (
                        <li
                          key={blog.id}
                          className="py-1 border-b border-gray-600 last:border-b-0"
                        >
                          {blog.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setConfirmationModalData(null)}
                      className="px-4 py-2 text-gray-400 hover:text-gray-200"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={handleForceCategoryDelete}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                    >
                      حذف دسته بندی و بلاگ‌های مرتبط
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                onSave={(content, status) => handleEditorSave(content, status)}
                slug={formData.slug}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewBlog;
