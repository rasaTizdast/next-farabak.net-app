"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { type ReactNode, useEffect, useRef, useState } from "react";
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

function BlogDialog({
  children,
  onClose,
  busy = false,
  title,
}: {
  children: ReactNode;
  onClose: () => void;
  busy?: boolean;
  title: string;
}) {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open && !busy) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          aria-describedby={undefined}
          aria-busy={busy}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 outline-none sm:p-4"
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function BlogForm({ mode, id = null, onClose }: BlogFormProps) {
  const [step, setStep] = useState(1);
  const [blogId, setBlogId] = useState<number | null>(null);
  const selectedImageRef = useRef<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const slugEditedRef = useRef(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showFaqManager, setShowFaqManager] = useState(false);
  const [editorContent, setEditorContent] = useState("");

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
    refetch: refetchBlog,
  } = useApiFetch<BlogData>(id ? `/api/blogs/getBlogData/${id}` : null);
  const isLoading = Boolean(id && (blogLoading || (!blogData && !blogError)));

  const { mutate: updateBlogMutate, error: contentError } =
    useApiMutation<Record<string, unknown>>("put");
  const { mutate: uploadImageMutate, error: imageError } = useApiMutation<
    FormData,
    { url: string }
  >("post");
  const { mutate: patchBlogMutate, error: patchError } = useApiMutation<
    Record<string, unknown>,
    { id: number }
  >("patch");
  const { mutate: createBlogMutate, error: createError } = useApiMutation<
    Record<string, unknown>,
    { id: number }
  >("post");

  useEffect(() => {
    if (blogData && !initializedRef.current) {
      initializedRef.current = true;

      setFormData({
        title: blogData.blog.title,
        SEO_Title: blogData.blog.SEO_Title,
        slug: blogData.blog.slug,
        author: blogData.blog.author ?? "",
        SEO_description: blogData.blog.SEO_description,
        image_URL: blogData.blog.image_URL,
        image_alt: blogData.blog.image_alt,
        categories: blogData.categories.map((c: Category) => c.id),
      });

      const rawImage = blogData.blog.image_URL;
      // Resolve image URL: prepend bucket URL if available
      // If blob, use as-is; otherwise prepend bucket URL
      let previewSrc: string | null = null;
      if (rawImage) {
        const bucketUrl = process.env.NEXT_PUBLIC_LIARA_BUCKET_URL;
        if (/^(https?:|blob:|data:)/.test(rawImage) || rawImage.startsWith("/")) {
          previewSrc = rawImage;
        } else {
          previewSrc = bucketUrl ? `${bucketUrl}/${rawImage}` : rawImage;
        }
      }
      setPreviewImage(previewSrc ?? null);

      setEditorContent(blogData.blog.content ?? "");
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

    if (!formData.slug) {
      setUploadError("لطفا ابتدا عنوان وبلاگ را وارد کنید");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setUploadError("حجم فایل نباید بیشتر از ۲ مگابایت باشد");
      e.target.value = "";
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("فرمت تصویر باید JPEG، PNG یا WEBP باشد");
      e.target.value = "";
      return;
    }

    setUploadError(null);
    selectedImageRef.current = file;
    setPreviewImage(URL.createObjectURL(file));
    e.target.value = "";
  };

  const handleRemoveImage = () => {
    selectedImageRef.current = null;
    setPreviewImage(null);
    setUploadError(null);
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
    if (submittingRef.current) return;
    setFormErrors([]);

    if (!validateForm()) {
      return;
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      let imageUrl = formData.image_URL ?? "";
      if (selectedImageRef.current) {
        const uploadedUrl = await handleImageUpload(selectedImageRef.current);
        if (!uploadedUrl) return;
        imageUrl = uploadedUrl;
        selectedImageRef.current = null;
        setFormData((previous) => ({ ...previous, image_URL: uploadedUrl }));
      }
      const existingId = id ?? blogId;
      if (existingId) {
        const data = await patchBlogMutate(`/api/blogs/update/${existingId}`, {
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
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleEditorSave = async (publish: boolean = false) => {
    if (submittingRef.current || !(id ?? blogId)) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
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
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (blogError || (mode === "edit" && !id)) {
    return (
      <BlogDialog title="خطا در بارگذاری وبلاگ" onClose={onClose}>
        <div className="w-full max-w-lg rounded-lg bg-gray-800 p-6 text-gray-200">
          <h2 id="blog-error-title" className="mb-4 text-xl font-bold">
            خطا در بارگذاری وبلاگ
          </h2>
          <p role="alert">{blogError || "شناسه وبلاگ معتبر نیست"}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {id && (
              <button
                type="button"
                onClick={refetchBlog}
                className="rounded-lg bg-blue-600 px-4 py-2"
              >
                تلاش دوباره
              </button>
            )}
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2">
              بستن وبلاگ
            </button>
          </div>
        </div>
      </BlogDialog>
    );
  }

  if (isLoading) {
    return (
      <BlogDialog title="در حال بارگذاری وبلاگ" onClose={onClose}>
        <div
          className="max-h-[95vh] w-full max-w-7xl overflow-auto rounded-lg bg-gray-800 p-6 text-gray-200 shadow-xl"
          role="status"
          aria-label="در حال بارگذاری وبلاگ"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 id="blog-loading-title" className="text-xl font-bold">
              در حال بارگذاری وبلاگ...
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن وبلاگ"
              className="rounded-lg p-2"
            >
              ✕
            </button>
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
                <div className="size-32 rounded-lg bg-gray-700" />
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
      </BlogDialog>
    );
  }

  return (
    <BlogDialog
      title={
        step === 2
          ? "نوشتن محتوای وبلاگ"
          : mode === "edit" || blogId
            ? "ویرایش وبلاگ"
            : "ایجاد وبلاگ جدید"
      }
      onClose={onClose}
      busy={isSubmitting}
    >
      <div
        dir="rtl"
        className="max-h-[95dvh] w-full max-w-7xl min-w-0 overflow-auto rounded-lg bg-gray-800 p-4 text-gray-200 shadow-xl sm:p-6"
      >
        {step === 1 ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 id="blog-form-title" className="text-xl font-bold">
                {mode === "edit" || blogId ? "ویرایش وبلاگ" : "ایجاد وبلاگ جدید"}
              </h2>
            </div>
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {formErrors.length > 0 && (
                <div role="alert" className="rounded-lg bg-red-800/30 p-4 text-red-400">
                  {formErrors.map((error) => (
                    <p key={error}>• {error}</p>
                  ))}
                </div>
              )}
              {(patchError || createError || imageError) && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-800/30 p-4 wrap-break-word text-red-400"
                >
                  {patchError || createError || imageError}
                </p>
              )}
              <fieldset disabled={isSubmitting} className="min-w-0 space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <BlogMetadataFields
                    title={formData.title}
                    onTitleChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: value,
                        ...(mode === "create" && !blogId && !slugEditedRef.current
                          ? { slug: generateSlug(value) }
                          : {}),
                      }))
                    }
                    slug={formData.slug}
                    onSlugChange={(value) => {
                      slugEditedRef.current = Boolean(value);
                      setFormData((prev) => ({ ...prev, slug: value }));
                    }}
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

                <div className="mt-6 flex flex-wrap justify-between gap-3">
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
                            className="size-5 animate-spin text-white"
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
              </fieldset>
            </form>
          </>
        ) : (
          <div className="flex h-full flex-col">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 id="blog-form-title" className="text-xl font-bold">
                نوشتن محتوای وبلاگ
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                  className="rounded-lg bg-gray-700 px-4 py-2 disabled:opacity-50"
                >
                  بازگشت به مشخصات
                </button>
                {(mode === "edit" || blogId) && (
                  <>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowFaqManager(true)}
                      className="rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700"
                    >
                      مدیریت سوالات متداول
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleEditorSave(false)}
                      className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                    >
                      ذخیره پیش‌نویس
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
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
                  aria-label="بستن وبلاگ"
                  disabled={isSubmitting}
                  className="text-gray-400 transition-colors hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </div>
            {contentError && (
              <p
                role="alert"
                className="mb-4 rounded-lg bg-red-800/30 p-4 wrap-break-word text-red-400"
              >
                {contentError}
              </p>
            )}
            <div className="flex-1">
              <TipTapEditor
                content={editorContent}
                onChange={setEditorContent}
                placeholder="محتوا را وارد کنید..."
                editable={!isSubmitting}
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
    </BlogDialog>
  );
}
