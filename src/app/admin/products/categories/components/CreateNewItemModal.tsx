import axios from "axios";
import { useState, useEffect, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";

import { useApiMutation } from "@/hooks/useApiMutation";

type CreateCategoryBody = {
  type: string;
  data: {
    name: string;
    slug: string;
    available: boolean;
    parentCategoryId: number | null;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
    topBlog: string;
    bottomBlog: string;
    banner: string | undefined;
  };
};

type CreateCategoryResponse = {
  success: boolean;
};

type CreateMutateFn = (
  url: string,
  data: CreateCategoryBody
) => Promise<CreateCategoryResponse | null>;

import CategoryBlogEditor from "./CategoryBlogEditor";
import { Category } from "../types/types";
import CategoryFields from "./newItemModalComponents/CategoryFields";
import SeoFields from "./newItemModalComponents/SeoFields";

// Helper function to check if the name is unique within categories or subcategories
const checkIfUnique = (
  name: string,
  isCategory: boolean,
  categories: Category[],
  parentCategoryId?: number
) => {
  if (isCategory) {
    return !categories.some((category) => category.Name === name);
  }

  const parentCategory = categories.find((category) => category.CategoryID === parentCategoryId);
  if (!parentCategory) return true;
  return !parentCategory.Subcategories.some((subcategory) => subcategory.Name === name);
};

async function doCreateItem(
  name: string,
  slug: string,
  available: boolean,
  parentCategoryId: number | undefined,
  seoTitle: string,
  seoDescription: string,
  seoKeywords: string[],
  topBlog: string,
  bottomBlog: string,
  bannerFile: File | null,
  bannerCleared: boolean,
  activeTab: string,
  categories: Category[],
  withRetry401: <T>(
    fn: () => Promise<T>,
    opts?: { retries?: number; baseDelayMs?: number }
  ) => Promise<T>,
  createMutate: CreateMutateFn,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setName: React.Dispatch<React.SetStateAction<string>>,
  setSlug: React.Dispatch<React.SetStateAction<string>>,
  setAvailable: React.Dispatch<React.SetStateAction<boolean>>,
  setParentCategoryId: React.Dispatch<React.SetStateAction<number | undefined>>,
  setSeoTitle: React.Dispatch<React.SetStateAction<string>>,
  setSeoDescription: React.Dispatch<React.SetStateAction<string>>,
  setSeoKeywords: React.Dispatch<React.SetStateAction<string[]>>,
  setKeywordInput: React.Dispatch<React.SetStateAction<string>>,
  setTopBlog: React.Dispatch<React.SetStateAction<string>>,
  setBottomBlog: React.Dispatch<React.SetStateAction<string>>,
  setBannerFile: (v: File | null) => void,
  setBannerPreview: React.Dispatch<React.SetStateAction<string>>,
  setBannerCleared: (v: boolean) => void,
  onClose: () => void,
  refetchCategories: () => void
) {
  setLoading(true);
  try {
    const result: CreateCategoryBody = {
      type: activeTab,
      data: {
        name,
        slug,
        available,
        parentCategoryId: activeTab === "Subcategory" ? (parentCategoryId ?? null) : null,
        seoTitle,
        seoDescription,
        seoKeywords,
        topBlog,
        bottomBlog,
        banner: undefined as string | undefined,
      },
    };

    if (bannerFile && !bannerCleared && slug) {
      const payload =
        activeTab === "Category"
          ? { type: "categoryBanner", contentType: bannerFile.type, categorySlug: slug }
          : {
              type: "categoryBanner",
              contentType: bannerFile.type,
              categorySlug: categories.find((c) => c.CategoryID === parentCategoryId)?.Slug || slug,
              subcategorySlug: slug,
            };

      type PresignResponse = { uploadUrl: string; key: string };
      const presignRes = await withRetry401(() =>
        axios.post<PresignResponse>("/api/s3/upload", payload)
      );
      const presign = presignRes.data;
      await axios.put(presign.uploadUrl, bannerFile, {
        headers: { "Content-Type": bannerFile.type },
      });
      result.data.banner = presign.key;
    }
    if (activeTab === "Category") {
      const catRes = await createMutate("/api/categories/createCategory", result);
      if (catRes) {
        toast.success("دسته‌بندی با موفقیت ایجاد شد!");
        onClose();
        refetchCategories();
      } else {
        throw new Error("خطا در ایجاد دسته‌بندی");
      }
    } else if (activeTab === "Subcategory") {
      const subRes = await createMutate("/api/categories/createSubcategory", result);
      if (subRes) {
        toast.success("زیردسته‌بندی با موفقیت ایجاد شد!");
        onClose();
        refetchCategories();
      } else {
        throw new Error("خطا در ایجاد زیردسته‌بندی");
      }
    }

    setName("");
    setSlug("");
    setAvailable(true);
    setParentCategoryId(undefined);
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords([]);
    setKeywordInput("");
    setTopBlog("");
    setBottomBlog("");
    setBannerFile(null);
    setBannerPreview("");
    setBannerCleared(false);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage =
        error.response?.data?.message || "خطا در ثبت آیتم. لطفاً دوباره تلاش کنید.";
      setError(errorMessage);
    } else {
      setError("خطای ناشناخته‌ای رخ داده است. لطفاً دوباره تلاش کنید.");
    }
  } finally {
    setLoading(false);
  }
}

async function withRetry401<T>(
  requestFn: () => Promise<T>,
  options: { retries?: number; baseDelayMs?: number } = {}
): Promise<T> {
  const { retries = 3, baseDelayMs = 300 } = options;
  let lastError: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await requestFn();
    } catch (error: unknown) {
      lastError = error;
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401 && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, baseDelayMs * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError as Error;
}

type FormData = {
  name: string;
  slug: string;
  available: boolean;
  parentCategoryId: number | undefined;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  keywordInput: string;
  error: string | null;
  topBlog: string;
  bottomBlog: string;
  bannerPreview: string;
};

const initialFormState: FormData = {
  name: "",
  slug: "",
  available: true,
  parentCategoryId: undefined,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: [],
  keywordInput: "",
  error: null,
  topBlog: "",
  bottomBlog: "",
  bannerPreview: "",
};

const CreateNewItemModal = ({
  isOpen,
  onClose,
  refetchCategories,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  refetchCategories: () => void;
  categories: Category[];
}) => {
  const [activeTab, setActiveTab] = useState("Category");
  const [loading, setLoading] = useState(false);
  const { mutate: createMutate } = useApiMutation<CreateCategoryBody, CreateCategoryResponse>(
    "post"
  );
  const bannerFileRef = useRef<File | null>(null);
  const bannerClearedRef = useRef<boolean>(false);

  const [form, setForm] = useState<FormData>(initialFormState);
  const {
    name,
    slug,
    available,
    parentCategoryId,
    seoTitle,
    seoDescription,
    seoKeywords,
    keywordInput,
    error,
    topBlog,
    bottomBlog,
    bannerPreview,
  } = form;

  // Create properly typed setter functions for form fields
  function makeSetter<K extends keyof FormData>(
    field: K
  ): React.Dispatch<React.SetStateAction<FormData[K]>> {
    return (v) =>
      setForm((prev) => ({
        ...prev,
        [field]:
          typeof v === "function" ? (v as (prev: FormData[K]) => FormData[K])(prev[field]) : v,
      }));
  }
  const setName = makeSetter("name");
  const setSlug = makeSetter("slug");
  const setAvailable = makeSetter("available");
  const setParentCategoryId = makeSetter("parentCategoryId");
  const setSeoTitle = makeSetter("seoTitle");
  const setSeoDescription = makeSetter("seoDescription");
  const setSeoKeywords = makeSetter("seoKeywords");
  const setKeywordInput = makeSetter("keywordInput");
  const setError = makeSetter("error");
  const setTopBlog = makeSetter("topBlog");
  const setBottomBlog = makeSetter("bottomBlog");
  const setBannerPreview = makeSetter("bannerPreview");
  const resetForm = useCallback(() => setForm(initialFormState), [setForm]);

  const resetGuard = useRef(false);
  // Reset the form fields when the modal is opened (when `isOpen` changes)
  useEffect(() => {
    if (!isOpen) {
      resetGuard.current = false;
      return;
    }
    if (resetGuard.current) return;
    resetGuard.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset the form when the modal opens, guarded by ref.
    resetForm();
    bannerFileRef.current = null;
    bannerClearedRef.current = false;
  }, [isOpen, activeTab, resetForm]);

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && keywordInput.trim() && !seoKeywords.includes(keywordInput.trim())) {
      setSeoKeywords([...seoKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== keyword));
  };

  const handleSubmit = async () => {
    if (name.trim() === "") {
      setError("نام نمی‌تواند خالی باشد.");
      return;
    }

    if (
      !checkIfUnique(
        name,
        activeTab === "Category",
        categories,
        activeTab === "Category" ? undefined : parentCategoryId
      )
    ) {
      setError("این نام قبلاً ثبت شده است.");
      return;
    }

    await doCreateItem(
      name,
      slug,
      available,
      parentCategoryId,
      seoTitle,
      seoDescription,
      seoKeywords,
      topBlog,
      bottomBlog,
      bannerFileRef.current,
      bannerClearedRef.current,
      activeTab,
      categories,
      withRetry401,
      createMutate,
      setLoading,
      setError,
      setName,
      setSlug,
      setAvailable,
      setParentCategoryId,
      setSeoTitle,
      setSeoDescription,
      setSeoKeywords,
      setKeywordInput,
      setTopBlog,
      setBottomBlog,
      (v: File | null) => {
        bannerFileRef.current = v;
      },
      setBannerPreview,
      (v: boolean) => {
        bannerClearedRef.current = v;
      },
      onClose,
      refetchCategories
    );
  };

  const isSubmitDisabled = () => {
    if (activeTab === "Category") {
      return (
        name.trim() === "" ||
        slug.trim() === "" ||
        seoTitle.trim() === "" ||
        seoDescription.trim() === ""
      );
    } else if (activeTab === "Subcategory") {
      return name.trim() === "" || slug.trim() === "" || !parentCategoryId;
    }
    return false;
  };

  // Dropzone for banner upload
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length > 0) {
        const file = accepted[0];
        bannerFileRef.current = file;
        setBannerPreview(URL.createObjectURL(file));
      }
    },
    [setBannerPreview]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
  });

  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerPreview]);

  return (
    <div
      className={`bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-lg ${
        !isOpen ? "hidden" : ""
      }`}
    >
      <div className="animate-fade-in w-full max-w-3xl">
        <div className="rtl flex justify-center gap-6">
          <button
            type="button"
            data-testid="newCategoryButton"
            onClick={() => setActiveTab("Category")}
            className={`rounded-t-xl px-6 py-3 font-medium transition-colors ${
              activeTab === "Category"
                ? "bg-gray-800 text-gray-200"
                : "bg-blue-800 text-white hover:animate-pulse"
            }`}
          >
            دسته‌بندی جدید
          </button>
          <button
            type="button"
            data-testid="newSubCategoryButton"
            onClick={() => setActiveTab("Subcategory")}
            className={`rounded-t-xl px-6 py-3 font-medium transition-colors ${
              activeTab === "Subcategory"
                ? "bg-gray-800 text-gray-200"
                : "bg-blue-800 text-white hover:animate-pulse"
            }`}
          >
            زیردسته‌بندی جدید
          </button>
        </div>

        <div className="max-h-[90dvh] overflow-y-scroll rounded-2xl bg-gray-800 p-6 pr-9 text-white shadow-xl">
          {activeTab === "Category" ? (
            <CategoryFields
              name={name}
              slug={slug}
              available={available}
              setName={setName}
              setSlug={setSlug}
              setAvailable={setAvailable}
              editable={true}
            />
          ) : (
            <div>
              <div className="mb-4">
                <label htmlFor="parent-category" className="block text-sm font-medium">
                  دسته‌بندی اصلی
                </label>
                <select
                  id="parent-category"
                  aria-label="دسته‌بندی اصلی"
                  value={parentCategoryId ?? ""}
                  onChange={(e) => setParentCategoryId(Number(e.target.value))}
                  className="mt-2 w-full rounded-md border bg-gray-700 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="" disabled>
                    انتخاب دسته‌بندی
                  </option>
                  {categories.map((category) => (
                    <option key={category.CategoryID} value={category.CategoryID}>
                      {category.Name}
                    </option>
                  ))}
                </select>
              </div>

              <CategoryFields
                name={name}
                slug={slug}
                available={available}
                setName={setName}
                setSlug={setSlug}
                setAvailable={setAvailable}
                editable={parentCategoryId !== undefined}
              />
            </div>
          )}

          <SeoFields
            seoTitle={seoTitle}
            seoDescription={seoDescription}
            seoKeywords={seoKeywords}
            setSeoTitle={setSeoTitle}
            setSeoDescription={setSeoDescription}
            keywordInput={keywordInput}
            setKeywordInput={setKeywordInput}
            addKeyword={addKeyword}
            removeKeyword={removeKeyword}
            editable={activeTab === "Category" || parentCategoryId !== undefined}
          />

          <div className="mt-6 rounded-md bg-gray-900 p-4">
            <div className="mb-6">
              <label htmlFor="category-banner" className="mb-2 block text-sm font-medium">
                تصویر بنر
              </label>
              <div
                {...getRootProps()}
                className={`cursor-pointer rounded-md border-2 border-dashed p-4 text-center transition-colors ${
                  isDragActive
                    ? "border-blue-400 bg-blue-900/20"
                    : isDragReject
                      ? "border-red-400 bg-red-900/20"
                      : "border-gray-600 hover:border-blue-400 hover:bg-blue-900/10"
                } ${bannerPreview ? "border-green-500" : ""}`}
              >
                <input {...getInputProps()} />
                {bannerPreview ? (
                  <div className="space-y-2">
                    <p className="text-green-400">تصویر انتخاب شد</p>
                    <p className="text-xs text-gray-400">
                      اندازه پیشنهادی: 1920x600 (16:5) | حداکثر 2MB
                    </p>
                  </div>
                ) : isDragActive ? (
                  <p>فایل را اینجا رها کنید ...</p>
                ) : isDragReject ? (
                  <p className="text-red-400">فقط فایل تصویر مجاز است!</p>
                ) : (
                  <div className="space-y-2">
                    <p>برای انتخاب تصویر کلیک کنید یا تصویر را به اینجا بکشید</p>
                    <p className="text-xs text-gray-400">
                      اندازه پیشنهادی: 1920x600 (16:5) | حداکثر 2MB
                    </p>
                  </div>
                )}
              </div>

              {bannerPreview && (
                <div
                  className="relative mt-4 w-full overflow-hidden rounded-md bg-gray-700"
                  style={{ aspectRatio: "16/5" }}
                >
                  <img
                    src={bannerPreview}
                    alt="پیش‌نمایش بنر"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              {bannerPreview && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    onClick={() => {
                      bannerFileRef.current = null;
                      setBannerPreview("");
                      bannerClearedRef.current = true;
                    }}
                  >
                    حذف بنر
                  </button>
                </div>
              )}
            </div>

            <CategoryBlogEditor
              label="متن بالای صفحه"
              value={topBlog}
              onChange={setTopBlog}
              placeholder="متن یا جدول دلخواه برای بالای صفحه دسته/زیردسته"
            />
            <CategoryBlogEditor
              label="متن پایین صفحه"
              value={bottomBlog}
              onChange={setBottomBlog}
              placeholder="متن یا جدول دلخواه برای پایین صفحه دسته/زیردسته"
            />
          </div>

          {error && <div className="mt-4 text-sm text-red-500">{error}</div>}
          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-white px-6 py-3 font-medium text-gray-700"
            >
              انصراف
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitDisabled() || loading} // Disable the button if loading
              className={`rounded-xl bg-blue-500 px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400 ${
                loading ? "cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? "در حال ثبت" // Add a loading spinner or any other indicator
                : "ثبت"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewItemModal;
