import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

import CategoryBlogEditor from "./CategoryBlogEditor";
import { Category, Subcategory } from "../types/types";

interface EditModalProps {
  isOpen: boolean;
  item: Category | Subcategory | null;
  onClose: () => void;
  // onSave: (updatedItem: Category | Subcategory) => void;
  onChange: (updatedFields: Partial<Category | Subcategory>) => void;
  refetchCategories: () => void;
  setIsEditModalOpen: (arg0: boolean) => void;
  setEditCategory: (arg0: Category | Subcategory | null) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  item,
  onClose,
  // onSave,
  onChange,
  refetchCategories,
  setEditCategory,
  setIsEditModalOpen,
}) => {
  const [keywordInput, setKeywordInput] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({}); // Store errors for all fields
  const [topBlog, setTopBlog] = useState<string>("");
  const [bottomBlog, setBottomBlog] = useState<string>("");
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [bannerDeleteRequested, setBannerDeleteRequested] = useState<boolean>(false);

  // Retry helper for 401 errors
  const withRetry401 = async <T,>(
    requestFn: () => Promise<T>,
    options: { retries?: number; baseDelayMs?: number } = {}
  ): Promise<T> => {
    const { retries = 3, baseDelayMs = 300 } = options;
    let lastError: unknown;
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        if (axios.isAxiosError(error) && error.response?.status === 401 && attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, baseDelayMs * (attempt + 1)));
          continue;
        }
        throw error;
      }
    }
    throw lastError as Error;
  };

  useEffect(() => {
    if (item && item.SEO_Details) {
      const seoDetails = item.SEO_Details;
      let parsedKeywords: string[] = [];
      if (Array.isArray(seoDetails.SEO_Keywords)) {
        parsedKeywords = seoDetails.SEO_Keywords;
      } else if (typeof seoDetails.SEO_Keywords === "string") {
        try {
          parsedKeywords = JSON.parse(seoDetails.SEO_Keywords);
        } catch (e) {
          parsedKeywords = [];
          console.error(e);
        }
      }
      setSeoKeywords(parsedKeywords);
    }
    if (item) {
      setTopBlog((item as any).TopBlog || "");
      setBottomBlog((item as any).BottomBlog || "");
      const existingBanner = (item as any).Banner as string | undefined;
      if (existingBanner) {
        setBannerPreview(`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${existingBanner}`);
      } else {
        setBannerPreview("");
      }
    }
  }, [item]);

  // Banner drop handlers MUST be declared before any conditional return to avoid hook order changes
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length > 0) {
      const f = accepted[0];
      setBannerFile(f);
      setBannerPreview(URL.createObjectURL(f));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
  });

  if (!isOpen || !item) return null;

  const seoDetails = item.SEO_Details || {
    SEO_Title: "",
    SEO_Description: "",
    SEO_Keywords: [],
  };

  // Regex patterns
  const regexPatterns = {
    Name: /^[a-zA-Z0-9-\u0600-\u06FF\s_-\u200C]{0,1000}$/, // Persian, English, numbers, up to 1000 characters
    Slug: /^[a-z0-9-]{0,200}$/, // Lowercase English, numbers, and dashes only, up to 200 characters
    SEO_Title: /^.{0,60}$/, // Any character, up to 50 characters
    SEO_Description: /^.{0,160}$/, // Any character, up to 4000 characters
    SEO_Keywords: /^.{0,4000}$/, // Any character, up to 4000 characters (no commas restriction)
  };

  // Persian error messages
  const errorMessages = {
    Name: "نام باید حروف فارسی یا انگلیسی و حداکثر ۱۰۰۰ کاراکتر باشد.",
    Slug: "شناسه فقط باید حروف انگلیسی کوچک، اعداد و خط تیره باشد و حداکثر ۲۰۰ کاراکتر باشد.",
    SEO_Title: "عنوان سئو باید حداکثر ۵۰ کاراکتر باشد.",
    SEO_Description: "توضیحات سئو باید حداکثر ۴۰۰۰ کاراکتر باشد.",
    SEO_Keywords: "کلمه کلیدی نمی‌تواند شامل کاما باشد و حداکثر ۴۰۰۰ کاراکتر باشد.",
  };

  // Generic input change handler
  const handleInputChange = (field: string, value: any) => {
    // Clear input and errors if value is empty
    if (value === "") {
      setErrors((prev) => ({ ...prev, [field]: "" }));

      if (["SEO_Title", "SEO_Description"].includes(field)) {
        onChange({
          SEO_Details: { ...seoDetails, [field]: value },
        });
      } else {
        onChange({ [field]: value });
      }
      return;
    }

    // Handle Available field separately
    if (field === "Available") {
      value = value === "true"; // Convert the string to a boolean
    }

    // Slug auto-correction: replace spaces with dashes and lowercase
    if (field === "Slug") {
      value = value.replace(/\s+/g, "-").toLowerCase();
    }

    // Validate input using regex patterns
    const pattern = regexPatterns[field as keyof typeof regexPatterns];
    if (pattern && !pattern.test(value)) {
      setErrors((prev) => ({
        ...prev,
        [field]: errorMessages[field as keyof typeof errorMessages] || "خطای نامشخص",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Update fields, handling SEO fields separately
    if (["SEO_Title", "SEO_Description"].includes(field)) {
      onChange({
        SEO_Details: { ...seoDetails, [field]: value },
      });
    } else {
      onChange({ [field]: value });
    }
  };
  // Handle adding a new keyword
  const addKeyword = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      keywordInput.trim() &&
      regexPatterns.SEO_Keywords.test(keywordInput.trim()) &&
      !seoKeywords.includes(keywordInput.trim())
    ) {
      const updatedKeywords = [...seoKeywords, keywordInput.trim()];
      setSeoKeywords(updatedKeywords);
      onChange({
        SEO_Details: { ...seoDetails, SEO_Keywords: updatedKeywords },
      });
      setKeywordInput("");
    }
  };

  // Handle removing a keyword
  const removeKeyword = (keyword: string) => {
    const updatedKeywords = seoKeywords.filter((k) => k !== keyword);
    setSeoKeywords(updatedKeywords);
    onChange({
      SEO_Details: { ...seoDetails, SEO_Keywords: updatedKeywords },
    });
  };

  // Validate all fields before saving
  const validateAllFields = () => {
    const validationErrors: Record<string, string> = {};

    if (!regexPatterns.Slug.test(item.Slug || "")) {
      validationErrors.Slug = errorMessages.Slug;
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleItemUpdate = async (updatedItem: Category | Subcategory) => {
    const isCategory = "CategoryID" in updatedItem && !("CategoryContentId" in updatedItem);
    const endpoint = `/api/categories/editCategory`;
    // Upload banner if selected
    let bannerKey: string | undefined = undefined;
    const existingKey = (item as any).Banner as string | undefined;
    if (bannerFile) {
      try {
        const payloadForUpload = isCategory
          ? {
              type: "categoryBanner",
              contentType: bannerFile.type,
              categorySlug: updatedItem.Slug,
            }
          : {
              type: "categoryBanner",
              contentType: bannerFile.type,
              categorySlug:
                (updatedItem as any).ParentSlug ||
                (updatedItem as any).CategorySlug ||
                updatedItem.Slug,
              subcategorySlug: updatedItem.Slug,
            };
        const { data: presign } = await withRetry401(() =>
          axios.post(`/api/s3/upload`, payloadForUpload)
        );
        await axios.put(presign.uploadUrl, bannerFile, {
          headers: { "Content-Type": bannerFile.type },
        });
        bannerKey = presign.key;
      } catch (e) {
        console.error(e);
        toast.error("خطا در آپلود بنر");
      }
    }

    const payload = isCategory
      ? {
          Type: "category",
          CategoryID: updatedItem.CategoryID,
          Name: updatedItem.Name,
          Slug: updatedItem.Slug,
          Available: updatedItem.Available,
          TopBlog: topBlog || null,
          BottomBlog: bottomBlog || null,
          Banner: bannerDeleteRequested && !bannerKey ? null : (bannerKey ?? existingKey ?? null),
          SEO_Details: {
            SEO_Title: updatedItem.SEO_Details.SEO_Title,
            SEO_Description: updatedItem.SEO_Details.SEO_Description,
            SEO_Keywords: updatedItem.SEO_Details.SEO_Keywords,
          },
        }
      : {
          Type: "subcategory",
          CategoryContentId: updatedItem.CategoryContentId,
          CategoryID: updatedItem.CategoryID,
          Name: updatedItem.Name,
          Slug: updatedItem.Slug,
          Available: updatedItem.Available,
          TopBlog: topBlog || null,
          BottomBlog: bottomBlog || null,
          Banner: bannerDeleteRequested && !bannerKey ? null : (bannerKey ?? existingKey ?? null),
          SEO_Details: {
            SEO_Title: updatedItem.SEO_Details.SEO_Title,
            SEO_Description: updatedItem.SEO_Details.SEO_Description,
            SEO_Keywords: updatedItem.SEO_Details.SEO_Keywords,
          },
        };

    try {
      await withRetry401(() => axios.patch(endpoint, payload));
      if (bannerDeleteRequested && existingKey && !bannerKey) {
        try {
          await withRetry401(() =>
            axios.delete("/api/s3/delete", {
              data: { type: "categoryBanner", key: existingKey },
            })
          );
        } catch (e) {
          console.error(e);
        }
      }
      toast.success("تغییرات با موفقیت اعمال شدند!");
      refetchCategories();
      setEditCategory(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("خطا در بروزرسانی، لطفا مجددا تلاش کنید.");
    }
  };

  // Handle save with validation
  const handleSave = () => {
    if (!validateAllFields()) return;

    handleItemUpdate({
      ...item,
      SEO_Details: {
        ...seoDetails,
        SEO_Keywords: seoKeywords,
      },
    });
  };

  // Clear everything when modal is closed
  const handleClose = () => {
    setErrors({}); // Reset errors
    setKeywordInput(""); // Clear the keyword input
    setTopBlog("");
    setBottomBlog("");
    onClose(); // Call the passed onClose handler
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="max-h-[95dvh] w-[60dvw] overflow-y-scroll rounded-lg bg-gray-800 p-6 pr-8 text-white shadow-lg">
        <h3 className="mb-4 text-center text-xl">ویرایش</h3>
        {/* Name Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">نام</label>
          <input
            type="text"
            value={item.Name || ""}
            onChange={(e) => handleInputChange("Name", e.target.value)}
            className={`w-full border bg-gray-700 p-2 ${
              errors.Name ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="نام را وارد کنید"
          />
          {errors.Name && <p className="text-sm text-red-500">{errors.Name}</p>}
        </div>

        {/* Banner Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">بنر</label>
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
              <img src={bannerPreview} alt="پیش‌نمایش بنر" className="h-full w-full object-cover" />
            </div>
          )}
          {bannerPreview && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                onClick={() => {
                  setBannerDeleteRequested(true);
                  setBannerFile(null);
                  setBannerPreview("");
                  onChange({ Banner: null } as any);
                }}
              >
                حذف بنر
              </button>
            </div>
          )}
        </div>

        {/* Slug Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">شناسه</label>
          <input
            type="text"
            value={item.Slug}
            onChange={(e) => handleInputChange("Slug", e.target.value)}
            className={`w-full border bg-gray-700 p-2 ${
              errors.Slug ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.Slug && <p className="text-sm text-red-500">{errors.Slug}</p>}
        </div>

        {/* Available Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">فعال</label>
          <select
            value={item.Available ? "true" : "false"} // Convert boolean to string for select value
            onChange={(e) => handleInputChange("Available", e.target.value)}
            className={`w-full border bg-gray-700 p-2 ${
              errors.Slug ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="true">بله</option>
            <option value="false">خیر</option>
          </select>
          {errors.Slug && <p className="text-sm text-red-500">{errors.Slug}</p>}
        </div>

        {/* SEO Title Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">عنوان سئو</label>
          <input
            type="text"
            value={seoDetails.SEO_Title || ""} // Ensure fallback to an empty string
            onChange={(e) => handleInputChange("SEO_Title", e.target.value)}
            className={`w-full border bg-gray-700 p-2 ${
              errors.SEO_Title ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="عنوان سئو را وارد کنید"
          />
          {errors.SEO_Title && <p className="text-sm text-red-500">{errors.SEO_Title}</p>}
        </div>

        {/* SEO Description Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">توضیحات سئو</label>
          <textarea
            value={seoDetails.SEO_Description || ""} // Ensure fallback to an empty string
            onChange={(e) => handleInputChange("SEO_Description", e.target.value)}
            className={`w-full border bg-gray-700 p-3 ${
              errors.SEO_Description ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={3}
            placeholder="توضیحات سئو را وارد کنید"
          />
          {errors.SEO_Description && (
            <p className="text-sm text-red-500">{errors.SEO_Description}</p>
          )}
        </div>

        {/* SEO Keywords Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">کلمات کلیدی سئو</label>
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={addKeyword}
            placeholder="کلمه کلیدی را وارد کنید و Enter بزنید"
            className={`w-full border bg-gray-700 p-2 ${
              errors.SEO_Keywords ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />

          {errors.SEO_Keywords && <p className="text-sm text-red-500">{errors.SEO_Keywords}</p>}

          <div className="mb-10 mt-3 flex flex-wrap gap-2">
            {seoKeywords.map((keyword: string) => (
              <button type="button"
                key={keyword}
                className="flex animate-fade-in items-center gap-2 rounded-lg bg-green-700 px-4 py-1 transition-all hover:bg-red-700 hover:text-white"
                onClick={() => removeKeyword(keyword)}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        <CategoryBlogEditor
          label="بلاگ بالای صفحه (ویرایشگر)"
          value={topBlog}
          onChange={setTopBlog}
          placeholder="این بخش اختیاری است. از تیترها، لیست و لینک پشتیبانی می‌شود."
        />

        <CategoryBlogEditor
          label="بلاگ پایین صفحه (ویرایشگر)"
          value={bottomBlog}
          onChange={setBottomBlog}
          placeholder="این بخش اختیاری است. از تیترها، لیست و لینک پشتیبانی می‌شود."
        />

        <div className="flex justify-end gap-2">
          <button type="button"
            onClick={handleClose}
            className="rounded bg-gray-50 px-4 py-2 text-black hover:bg-gray-100"
          >
            بستن
          </button>
          <button type="button"
            onClick={handleSave}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            ذخیره تغییرات
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
