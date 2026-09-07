"use client";

import Image from "next/image";
import { BiTrash } from "react-icons/bi";

interface BlogSEOPartProps {
  mode: "create" | "edit";
  slug: string;
  SEO_Title: string;
  onSEOTitleChange: (value: string) => void;
  SEO_description: string;
  onSEODescriptionChange: (value: string) => void;
  image_alt: string;
  onImageAltChange: (value: string) => void;
  previewImage: string | null;
  uploadError: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const BlogSEOPart: React.FC<BlogSEOPartProps> = ({
  mode,
  slug,
  SEO_Title,
  onSEOTitleChange,
  SEO_description,
  onSEODescriptionChange,
  image_alt,
  onImageAltChange,
  previewImage,
  uploadError,
  onFileChange,
  onRemoveImage,
}) => {
  return (
    <>
      <div>
        <label htmlFor="blog-seo-title" className="mb-1 block text-sm font-medium">
          عنوان SEO
        </label>
        <input
          id="blog-seo-title"
          type="text"
          required
          maxLength={60}
          value={SEO_Title}
          onChange={(e) => onSEOTitleChange(e.target.value)}
          aria-label="عنوان SEO"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <span className="text-xs text-gray-400">{SEO_Title.length}/60 کاراکتر</span>
      </div>
      <div className="md:col-span-2">
        <label htmlFor="blog-seo-desc" className="mb-1 block text-sm font-medium">
          توضیحات SEO
        </label>
        <textarea
          id="blog-seo-desc"
          required
          maxLength={165}
          value={SEO_description}
          onChange={(e) => onSEODescriptionChange(e.target.value)}
          aria-label="توضیحات SEO"
          className="h-24 w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
        />
        <span className="text-xs text-gray-400">{SEO_description.length}/165 کاراکتر</span>
      </div>
      <div className="md:col-span-2">
        <label htmlFor="blog-image" className="mb-1 block text-sm font-medium">
          تصویر بلاگ
        </label>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <label className="relative cursor-pointer">
              <span className="inline-block rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
                انتخاب تصویر
              </span>
              <input
                id="blog-image"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
            </label>

            {previewImage && (
              <div className="group relative">
                <Image
                  src={
                    previewImage.startsWith("blob:") || previewImage.startsWith("http")
                      ? previewImage
                      : process.env.NEXT_PUBLIC_LIARA_BUCKET_URL
                        ? `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${previewImage}`
                        : previewImage
                  }
                  height={mode === "edit" ? 144 : 128}
                  width={mode === "edit" ? 250 : 128}
                  alt="پیش‌نمایش"
                  className={
                    mode === "edit"
                      ? "h-36 rounded-lg border-2 border-gray-600 object-cover"
                      : "size-32 rounded-lg border-2 border-gray-600 object-cover"
                  }
                />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 text-xs text-white transition-colors hover:bg-red-700"
                  aria-label="حذف تصویر"
                >
                  <BiTrash size={16} />
                </button>
              </div>
            )}
          </div>

          {uploadError && <p className="mt-1 text-sm text-red-400">{uploadError}</p>}

          <div className="w-full">
            <input
              id="blog-image-alt"
              type="text"
              required
              placeholder="متن جایگزین تصویر (الزامی)"
              value={image_alt}
              disabled={!slug}
              onChange={(e) => onImageAltChange(e.target.value)}
              aria-label="متن جایگزین تصویر"
              className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <p className="text-xs text-gray-400">
            حداکثر حجم فایل: ۲ مگابایت (فرمت‌های مجاز: JPEG, PNG, WEBP)
          </p>
        </div>
      </div>
    </>
  );
};

export default BlogSEOPart;
