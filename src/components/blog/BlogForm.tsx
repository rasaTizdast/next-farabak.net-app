"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { TipTapEditor } from "@/components/editor/TipTapEditor";
import FaqManager from "@/components/FaqManager";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";
import { generateSlug } from "@/utils/generateSlug";

import BlogCategoryManager from "./BlogCategoryManager";
import BlogMetadataFields from "./BlogMetadataFields";
import BlogSEOPart from "./BlogSEOPart";

interface BlogFormData {
  title: string;
  SEO_Title: string;
  slug: string;
  author: string;
  SEO_description: string;
  image_alt: string;
  categories: number[];
  image_URL?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

type BlogData = {
  blog: BlogFormData & { content?: string };
  categories: Category[];
};

export interface BlogFormProps {
  mode: "create" | "edit";
  id?: number | null;
  onClose: () => void;
}

export function BlogForm({ mode, id = null, onClose }: BlogFormProps) {
  const [step, setStep] = useState(1);
  const [blogId, setBlogId] = useState<number | null>(null);
  const selectedImageRef = useRef<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showFaqManager, setShowFaqManager] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [blogContent, setBlogContent] = useState("");

  useEffect(() => {
    return () => {
      if (previewImage?.startsWith("blob:")) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

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

  const initializedRef = useRef(false);
  const {
    data: blogData,
    loading: blogLoading,
    error: blogError,
  } = useApiFetch<BlogData>(id ? `/api/blogs/getBlogData/${id}` : null);
  const isLoading = id ? blogLoading : false;

  const { mutate: updateBlogMutate } = useApiMutation<Record<string, unknown>>("put");
  const { mutate: uploadImageMutate } = useApiMutation<FormData, { url: string }>("post");
  const { mutate: patchBlogMutate } = useApiMutation<Record<string, unknown>, { id: number }>(
    "patch"
  );
  const { mutate: createBlogMutate } = useApiMutation<Record<string, unknown>, { id: number }>(
    "post"
  );

  useEffect(() => {
    if (blogContent) {
      setEditorContent(blogContent);
    }
  }, [blogContent]);

  useEffect(() => {
    if (blogData && !initializedRef.current) {
      initializedRef.current = true;

      setFormData({
        title: blogData.blog.title,
        SEO_Title: blogData.blog.SEO_Title,
        slug: blogData.blog.slug,
        author: blogData.blog.author,
        SEO_description: blogData.blog.SEO_description,
        image_URL: blogData.blog.image_URL,
        image_alt: blogData.blog.image_alt,
        categories: blogData.categories.map((c: Category) => c.id),
      });
      setPreviewImage(blogData.blog.image_URL ?? null);
      setBlogContent(blogData.blog.content ?? "");
    }
  }, [blogData]);

  useEffect(() => {
    if (blogError) {
      console.error("Error fetching blog:", blogError);
      toast.error("Error loading blog data");
    }
  }, [blogError]);

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

    if (previewImage?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }

    if (!formData.slug) {
      setUploadError("لطفا ابتدا عنوان وبلاگ را وارد کنید");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("حجم فایل نباید بیشتر از ۲ مگابایت باشد");
      return;
    }

    setUploadError(null);
    selectedImageRef.current = file;
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    if (mode === "edit" && previewImage?.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    selectedImageRef.current = null;
    setPreviewImage(null);
    setFormData((prev) => ({
      ...prev,
      image_URL: "",
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];
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

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors([]);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    let imageUrl = mode === "edit" ? formData.image_URL : "";

    if (selectedImageRef.current) {
      const uploadedUrl = await handleImageUpload(selectedImageRef.current);
      if (!uploadedUrl) {
        setIsSubmitting(false);
        return;
      }
      imageUrl = uploadedUrl;
    }

    try {
      if (mode === "edit") {
        const data = await patchBlogMutate(`/api/blogs/update/${id}`, {
          ...formData,
          image_URL: imageUrl,
        });

        if (data) {
          setStep(2);
        } else {
          toast.error("خطا در ذخیره وبلاگ. لطفا دوباره تلاش کنید.");
        }
      } else {
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
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditorSave = async (publish: boolean = false) => {
    const res = await updateBlogMutate(`/api/blogs/update/${id ?? blogId}`, {
      content: editorContent,
      status: publish ? "Published" : "Draft",
    });

    if (res) {
      toast.success(publish ? "وبلاگ با موفقیت منتشر شد" : "پیش‌نویس با موفقیت ذخیره شد");
      onClose();
    } else {
      toast.error("خطا در بروزرسانی وبلاگ. لطفا دوباره تلاش کنید.");
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div
          className="max-h-[95vh] w-full max-w-7xl overflow-auto rounded-lg bg-gray-800 p-6 text-gray-200 shadow-xl"
          role="status"
          aria-label="در حال بارگذاری وبلاگ"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold">در حال بارگذاری وبلاگ...</h2>
            <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-700" />
          </div>

          <div className="grid animate-pulse grid-cols-1 gap-4 md:grid-cols-2">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="mb-2 h-4 w-1/4 rounded bg-gray-700" />
                <div className="h-10 rounded-lg bg-gray-700" />
              </div>
            ))}

            <div className="space-y-4 md:col-span-2">
              <div className="h-4 w-1/4 rounded bg-gray-700" />
              <div className="flex items-center gap-4">
                <div className="h-10 w-32 rounded-lg bg-gray-700" />
                <div className="h-32 w-32 rounded-lg bg-gray-700" />
              </div>
              <div className="h-10 rounded-lg bg-gray-700" />
            </div>

            <div className="mt-4 space-y-4 md:col-span-2">
              <div className="h-4 w-1/4 rounded bg-gray-700" />
              <div className="h-10 w-full rounded-lg bg-gray-700" />
              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-8 w-20 rounded-lg bg-gray-700" />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <div className="h-10 w-20 rounded-lg bg-gray-700" />
            <div className="h-10 w-32 rounded-lg bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

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
                  {formErrors.map((error) => (
                    <p key={error}>• {error}</p>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <BlogMetadataFields
                  title={formData.title}
                  onTitleChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: value,
                      ...(mode === "create" ? { slug: generateSlug(value) } : {}),
                    }))
                  }
                  slug={formData.slug}
                  onSlugChange={(value) => setFormData((prev) => ({ ...prev, slug: value }))}
                  author={formData.author}
                  onAuthorChange={(value) => setFormData((prev) => ({ ...prev, author: value }))}
                />
                <BlogSEOPart
                  mode={mode}
                  slug={formData.slug}
                  SEO_Title={formData.SEO_Title}
                  onSEOTitleChange={(value) =>
                    setFormData((prev) => ({ ...prev, SEO_Title: value }))
                  }
                  SEO_description={formData.SEO_description}
                  onSEODescriptionChange={(value) =>
                    setFormData((prev) => ({ ...prev, SEO_description: value }))
                  }
                  image_alt={formData.image_alt}
                  onImageAltChange={(value) =>
                    setFormData((prev) => ({ ...prev, image_alt: value }))
                  }
                  previewImage={previewImage}
                  uploadError={uploadError}
                  onFileChange={handleImageChange}
                  onRemoveImage={handleRemoveImage}
                />
                <BlogCategoryManager
                  selectedCategoryIds={formData.categories}
                  onSelectedCategoryIdsChange={(ids) =>
                    setFormData((prev) => ({ ...prev, categories: ids }))
                  }
                />
              </div>

              <div className="mt-6 flex justify-between">
                {(mode === "edit" || blogId) && (
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
                      <span className="absolute top-2.5 left-3">
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
          </>
        ) : (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">نوشتن محتوای وبلاگ</h2>
              <div className="flex gap-3">
                {(mode === "edit" || blogId) && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowFaqManager(true)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    >
                      مدیریت سوالات متداول
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditorSave(false)}
                      className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                    >
                      ذخیره پیش‌نویس
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditorSave(true)}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      انتشار
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 transition-colors hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1">
              <TipTapEditor
                content={editorContent}
                onChange={setEditorContent}
                placeholder="محتوا را وارد کنید..."
              />
            </div>
          </div>
        )}
      </div>

      {showFaqManager && (
        <FaqManager
          blogId={mode === "edit" ? id : blogId}
          onClose={() => setShowFaqManager(false)}
        />
      )}
    </div>
  );
}
