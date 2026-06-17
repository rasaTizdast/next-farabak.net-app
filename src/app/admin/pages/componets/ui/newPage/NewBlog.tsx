// src/components/NewBlog.tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiTrash } from "react-icons/bi";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";
import FaqManager from "@/components/FaqManager";

import TipTapBlogEditor from "../blogEditor/TipTapEditor";

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

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
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

  // FAQ management state
  const [showFaqManager, setShowFaqManager] = useState(false);

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
    const payload = new FormData();
    payload.append("file", file);
    payload.append("slug", formData.slug);

    const data = await uploadImageMutate("/api/manageBlog/upload", payload);
    if (data) {
      return data.url;
    }
    toast.error("خطا در آپلود تصویر");
    return null;
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

  const { data: categoriesData } = useApiFetch("/api/blogs/categories");
  const { mutate: deleteCategoryMutate } = useApiMutation("delete");
  const { mutate: createCategoryMutate } = useApiMutation("post");
  const { mutate: updateBlogMutate } = useApiMutation("put");
  const { mutate: uploadImageMutate } = useApiMutation("post");
  const { mutate: createBlogMutate } = useApiMutation("post");

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

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

    const res = await deleteCategoryMutate("/api/blogs/categories", {
      id: confirmationModalData.categoryId,
      force: true,
    });

    if (res) {
      setCategories((prev) => prev.filter((c) => c.id !== confirmationModalData.categoryId));
      setFormData((prev) => ({
        ...prev,
        categories: prev.categories.filter((id) => id !== confirmationModalData.categoryId),
      }));
      toast.success(`دسته بندی و ${confirmationModalData.blogs.length} بلاگ مرتبط با آن حذف شدند`);
      setConfirmationModalData(null);
    } else {
      toast.error("خطا در حذف دسته بندی");
    }
  };

  // Add these handler functions
  const handleDeleteCategory = async (categoryId: number) => {
    const res = await deleteCategoryMutate("/api/blogs/categories", { id: categoryId });

    if (res === null) {
      const blogsResponse = await fetch(`/api/blogs/categories/${categoryId}/blogs`);
      const blogsUsingCategory = await blogsResponse.json();

      if (Array.isArray(blogsUsingCategory) && blogsUsingCategory.length > 0) {
        setConfirmationModalData({
          categoryId,
          categoryName: categories.find((c) => c.id === categoryId)?.name || "Category",
          blogs: blogsUsingCategory,
        });
        setShowDeleteConfirm(null);
        return;
      }

      toast.error("خطا در حذف دسته بندی");
      setShowDeleteConfirm(null);
      return;
    }

    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((id) => id !== categoryId),
    }));
    toast.success("دسته بندی با موفقیت حذف شد");
    setShowDeleteConfirm(null);
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast.error("نام دسته بندی الزامی است");
      return;
    }

    if (!newCategory.slug) {
      toast.error("شناسه دسته بندی الزامی است");
      return;
    }

    if (!/^[a-z0-9\-_]+$/.test(newCategory.slug)) {
      toast.error("شناسه فقط می‌تواند شامل حروف انگلیسی، اعداد، خط تیره و زیرخط باشد");
      return;
    }

    const createdCategory = await createCategoryMutate("/api/blogs/categories", newCategory);

    if (createdCategory) {
      setCategories((prev) => [...prev, createdCategory]);
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, createdCategory.id],
      }));
      setShowCreateModal(false);
      setNewCategory({ name: "", slug: "" });
      toast.success("دسته بندی با موفقیت ایجاد شد");
    } else {
      toast.error("خطا در ایجاد دسته بندی");
    }
  };

  const handleAddCategory = async (category: Category | string) => {
    if (typeof category === "string") {
      const newCategory = await createCategoryMutate("/api/blogs/categories", { name: category });

      if (newCategory) {
        setCategories((prev) => [...prev, newCategory]);
        setFormData((prev) => ({
          ...prev,
          categories: [...prev.categories, newCategory.id],
        }));
      } else {
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

    let imageUrl = "";
    if (selectedImage) {
      const uploadedUrl = await handleImageUpload(selectedImage);
      if (!uploadedUrl) {
        setIsSubmitting(false);
        return;
      }
      imageUrl = uploadedUrl;
    }

    const data = await createBlogMutate("/api/blogs/create", {
      ...formData,
      image_URL: imageUrl,
    });

    if (data) {
      setBlogId(data.id);
      setStep(2);
    } else {
      toast.error("خطا در ایجاد وبلاگ. لطفا دوباره تلاش کنید.");
    }

    setIsSubmitting(false);
  };

  const handleEditorSave = async (content: string, publish: boolean = false) => {
    const res = await updateBlogMutate(`/api/blogs/update/${blogId}`, {
      content,
      status: publish ? "Published" : "Draft",
    });

    if (res) {
      toast.success(publish ? "وبلاگ با موفقیت منتشر شد" : "پیش‌نویس با موفقیت ذخیره شد");
      onClose();
    } else {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-7xl overflow-auto rounded-lg bg-gray-800 p-6 text-gray-200 shadow-xl">
        {step === 1 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">ایجاد وبلاگ جدید</h2>
            </div>
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {formErrors.length > 0 && (
                <div className="rounded-lg bg-red-800/30 p-4 text-red-400">
                  {formErrors.map((error, index) => (
                    <p key={index}>• {error}</p>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">عنوان وبلاگ</label>
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
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">عنوان SEO</label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={formData.SEO_Title}
                    onChange={(e) => setFormData({ ...formData, SEO_Title: e.target.value })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">
                    {formData.SEO_Title.length}/60 کاراکتر
                  </span>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">نویسنده</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    شناسه (فقط حروف انگلیسی، اعداد، خط تیره و زیرخط)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9\-_]/g, ""),
                      })
                    }
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    placeholder="مثال: my-blog-post"
                    dir="ltr"
                  />
                  <span className="text-xs text-gray-400">
                    شناسه باید به انگلیسی باشد و فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد، خط تیره
                    و زیرخط باشد
                  </span>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">توضیحات SEO</label>
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
                    className="h-24 w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">
                    {formData.SEO_description.length}/165 کاراکتر
                  </span>
                </div>
                {/* Updated image section */}
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">تصویر بلاگ</label>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <label className="relative cursor-pointer">
                        <span className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
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
                        <div className="group relative">
                          <Image
                            height={128}
                            width={128}
                            src={previewImage}
                            alt="پیش‌نمایش"
                            className="h-32 w-32 rounded-lg border-2 border-gray-600 object-cover"
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
                            className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-xs text-white transition-colors hover:bg-red-700"
                          >
                            <BiTrash size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    {uploadError && <p className="mt-1 text-sm text-red-400">{uploadError}</p>}

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
                        className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <p className="text-xs text-gray-400">
                      حداکثر حجم فایل: ۲ مگابایت (فرمت‌های مجاز: JPEG, PNG, WEBP)
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium">دسته بندی‌ها</label>
                <div className="relative">
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    placeholder="جستجو یا افزودن دسته بندی..."
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                  />
                  {(isInputFocused || categoryInput) && (
                    <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-600 bg-gray-700">
                      {filteredCategories.map((category) => (
                        <div
                          key={category.id}
                          className="group flex items-center justify-between px-4 py-2 hover:bg-gray-600"
                        >
                          <button
                            type="button"
                            onClick={() => handleAddCategory(category)}
                            className="flex-grow text-right"
                          >
                            {category.name}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(category.id);
                            }}
                            className="opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <BiTrash
                              size={20}
                              className="text-red-400 transition-all hover:text-red-500"
                            />
                          </button>
                        </div>
                      ))}

                      {categoryInput && !categories.some((c) => c.name === categoryInput) && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewCategory({
                              name: categoryInput,
                              slug: generateSlug(categoryInput),
                            });
                            setShowCreateModal(true);
                          }}
                          className="w-full bg-blue-600 px-4 py-2 text-center hover:bg-blue-700"
                        >
                          ایجاد دسته بندی جدید
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.categories.map((categoryId) => {
                    const category = categories.find((c) => c.id === categoryId);
                    return (
                      <span
                        key={categoryId}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            categories: prev.categories.filter((id) => id !== categoryId),
                          }))
                        }
                        className="flex items-center gap-1 rounded-lg bg-green-700 px-3 py-1 text-base transition-all hover:cursor-pointer hover:bg-red-600"
                      >
                        {category?.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                {blogId && (
                  <button
                    type="button"
                    onClick={() => setShowFaqManager(true)}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                  >
                    مدیریت سوالات متداول
                  </button>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-400 transition-colors hover:text-gray-200"
                    disabled={isSubmitting}
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="relative rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <span className="absolute left-3 top-2.5">
                        <svg
                          className="h-5 w-5 animate-spin text-white"
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
              </div>
            </form>
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-96 rounded-lg bg-gray-800 p-6">
                  <h3 className="mb-4 text-lg font-bold">حذف دسته بندی</h3>
                  <p>آیا مطمئن هستید که می‌خواهید این دسته بندی را حذف کنید؟</p>
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button"
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-4 py-2 text-gray-400 hover:text-gray-200"
                    >
                      انصراف
                    </button>
                    <button type="button"
                      onClick={() => handleDeleteCategory(showDeleteConfirm)}
                      className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            )}
            {showCreateModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-96 rounded-lg bg-gray-800 p-6">
                  <h3 className="mb-4 text-lg font-bold">ایجاد دسته بندی جدید</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">نام</label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2"
                        placeholder="نام دسته بندی"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
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
                        className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2"
                        placeholder="مثال: my-category-name"
                        dir="ltr"
                      />
                      <span className="text-xs text-gray-400">
                        شناسه باید به انگلیسی باشد و فقط می‌تواند شامل حروف کوچک انگلیسی، اعداد، خط
                        تیره و زیرخط باشد
                      </span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button"
                        onClick={() => setShowCreateModal(false)}
                        className="px-4 py-2 text-gray-400 hover:text-gray-200"
                      >
                        انصراف
                      </button>
                      <button type="button"
                        onClick={handleCreateCategory}
                        className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700"
                        disabled={
                          !newCategory.name ||
                          !newCategory.slug ||
                          !/^[a-z0-9\-_]+$/.test(newCategory.slug)
                        }
                      >
                        ایجاد
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {confirmationModalData && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="w-96 rounded-lg bg-gray-800 p-6">
                  <h3 className="mb-4 text-lg font-bold">هشدار: دسته بندی در حال استفاده</h3>
                  <p>
                    دسته بندی &quot;{confirmationModalData.categoryName}&quot; در{" "}
                    {confirmationModalData.blogs.length} بلاگ استفاده شده است.
                  </p>
                  <div className="mt-4">
                    <h4 className="mb-2 font-semibold">بلاگ‌های مرتبط:</h4>
                    <ul className="max-h-40 overflow-y-auto rounded-lg bg-gray-700 p-2">
                      {confirmationModalData.blogs.map((blog) => (
                        <li key={blog.id} className="border-b border-gray-600 py-1 last:border-b-0">
                          {blog.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button type="button"
                      onClick={() => setConfirmationModalData(null)}
                      className="px-4 py-2 text-gray-400 hover:text-gray-200"
                    >
                      انصراف
                    </button>
                    <button type="button"
                      onClick={handleForceCategoryDelete}
                      className="rounded-lg bg-red-600 px-4 py-2 hover:bg-red-700"
                    >
                      حذف دسته بندی و بلاگ‌های مرتبط
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">نوشتن محتوای وبلاگ</h2>
              <div className="flex gap-3">
                {blogId && (
                  <button type="button"
                    onClick={() => setShowFaqManager(true)}
                    className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                  >
                    مدیریت سوالات متداول
                  </button>
                )}
                <button type="button"
                  onClick={onClose}
                  className="text-gray-400 transition-colors hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
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

      {/* FAQ Manager Modal */}
      {showFaqManager && <FaqManager blogId={blogId} onClose={() => setShowFaqManager(false)} />}
    </div>
  );
};

export default NewBlog;
