"use client";

import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { BiTrash } from "react-icons/bi";
import { DatePicker } from "zaman";

import { useApiMutation } from "@/hooks/useApiMutation";
import { generateSlug } from "@/utils/generateSlug";

type NewProjectProps = {
  onClose: () => void;
};

const removeFile = (setter: Function, files: File[], index: number) => {
  const newFiles = files.filter((_, i) => i !== index);
  setter(newFiles);
};

const NewProject: React.FC<NewProjectProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    isActive: true,
    date: "",
    city: "",
  });
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [detailImages, setDetailImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { mutate: createProjectMutate } = useApiMutation("post");

  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [detailImagePreviews, setDetailImagePreviews] = useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (mainImage) {
      const url = URL.createObjectURL(mainImage);
      setMainImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setMainImagePreview(null);
  }, [mainImage]);

  useEffect(() => {
    const urls = detailImages.map((f) => URL.createObjectURL(f));
    setDetailImagePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [detailImages]);

  useEffect(() => {
    const urls = videos.map((f) => URL.createObjectURL(f));
    setVideoPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [videos]);

  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === "slug") {
      // Mark as manually edited and sanitize input
      const sanitized = generateSlug(value);
      setFormData((prev) => ({ ...prev, slug: sanitized }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  // Handle date change
  const handleDateChange = (dateValue: Date) => {
    setFormData((prev) => ({ ...prev, date: dateValue.toISOString() }));
  };

  // Submit handler
  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    // Validate required fields
    if (!formData.title) newErrors.title = "عنوان الزامی است";
    if (!formData.description) newErrors.description = "توضیحات الزامی است";
    if (!formData.slug) newErrors.slug = "شناسه الزامی است";
    if (!formData.date) newErrors.date = "تاریخ الزامی است";
    if (!formData.city) newErrors.city = "شهر الزامی است";
    if (!mainImage) newErrors.mainImage = "عکس اصلی الزامی است";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("isActive", formData.isActive.toString());
      formDataToSend.append("date", formData.date);
      formDataToSend.append("city", formData.city);
      if (mainImage) formDataToSend.append("mainImage", mainImage);
      detailImages.forEach((file) => formDataToSend.append("detailImages", file));
      videos.forEach((file) => formDataToSend.append("videos", file));

      const res = await createProjectMutate("/api/projects", formDataToSend);

      if (res) {
        onClose();
      } else {
        setErrors((prev) => ({ ...prev, form: "خطا در ذخیره پروژه." }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Main image dropzone
  const onMainImageDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles[0]?.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, mainImage: "Maximum file size is 2MB" }));
      return;
    }
    setErrors((prev) => ({ ...prev, mainImage: "" }));
    setMainImage(acceptedFiles[0]);
  };

  const { getRootProps: getMainRootProps, getInputProps: getMainInputProps } = useDropzone({
    onDrop: onMainImageDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  // Detail images dropzone
  const onDetailsDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => file.size <= 2 * 1024 * 1024);
    const newFiles = [...detailImages, ...validFiles].slice(0, 10);

    if (validFiles.length !== acceptedFiles.length) {
      setErrors((prev) => ({
        ...prev,
        details: "Some images exceeded 2MB limit",
      }));
    }
    setDetailImages(newFiles);
  };

  const { getRootProps: getDetailsRootProps, getInputProps: getDetailsInputProps } = useDropzone({
    onDrop: onDetailsDrop,
    accept: { "image/*": [] },
    maxFiles: 10,
  });

  // Videos dropzone
  const onVideosDrop = (acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => file.size <= 50 * 1024 * 1024);
    const newFiles = [...videos, ...validFiles].slice(0, 3);

    if (validFiles.length !== acceptedFiles.length) {
      setErrors((prev) => ({
        ...prev,
        videos: "Some videos exceeded 10MB limit",
      }));
    }
    setVideos(newFiles);
  };

  const { getRootProps: getVideosRootProps, getInputProps: getVideosInputProps } = useDropzone({
    onDrop: onVideosDrop,
    accept: { "video/*": [] },
    maxFiles: 3,
  });

  return (
    <div className="bg-opacity-50 fixed inset-0 flex items-center justify-center bg-black backdrop-blur-sm">
      <div className="max-h-[95vh] w-full max-w-4xl overflow-auto rounded-xl bg-gray-800 p-6 text-gray-100 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">ساخت پروژه جدید</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="rounded-full p-2 transition-colors hover:bg-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Text Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-project-title" className="mb-2 block font-medium">
                تیتر پروژه *
              </label>
              <input
                id="new-project-title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                aria-label="تیتر پروژه"
                className="w-full rounded-lg bg-gray-700 p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="new-project-slug" className="mb-2 block font-medium">
                شناسه *
              </label>
              <input
                id="new-project-slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                aria-label="شناسه پروژه"
                className="w-full rounded-lg bg-gray-700 p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.slug && <p className="mt-1 text-sm text-red-400">{errors.slug}</p>}
            </div>

            <div>
              <label htmlFor="new-project-city" className="mb-2 block font-medium">
                شهر *
              </label>
              <input
                id="new-project-city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                aria-label="شهر پروژه"
                className="w-full rounded-lg bg-gray-700 p-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city}</p>}
            </div>

            <div>
              <label htmlFor="new-project-date" className="mb-2 block font-medium">
                تاریخ *
              </label>
              <DatePicker
                onChange={(e) => handleDateChange(e.value)}
                weekends={[5, 6]}
                round="x3"
                accentColor="#226bff"
                inputClass="w-full p-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                className="mt-2"
              />
              {errors.date && <p className="mt-1 text-sm text-red-400">{errors.date}</p>}
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center gap-2">
            <label htmlFor="new-project-isActive" className="font-medium">
              پروژه فعال باشد
            </label>
            <input
              id="new-project-isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
              aria-label="پروژه فعال باشد"
              className="size-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-600"
            />
          </div>

          {/* Main Image Section */}
          <div>
            <h3 className="mb-3 font-medium">عکس اصلی (الزامی، حداکثر ۲ مگابایت)</h3>
            <div
              {...getMainRootProps()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-600 p-6 text-center transition-colors hover:border-blue-500"
            >
              <input {...getMainInputProps()} />
              {mainImage ? (
                <div className="group relative">
                  <img
                    src={mainImagePreview ?? ""}
                    alt="تصویر اصلی"
                    className="mx-auto max-h-48 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setMainImage(null)}
                    className="absolute top-1 right-1 rounded-lg bg-red-500 p-2 opacity-0 transition-[opacity,background-color] group-hover:opacity-100 hover:bg-red-600"
                    aria-label="حذف عکس اصلی"
                  >
                    <BiTrash size={20} />
                  </button>
                </div>
              ) : (
                <p>عکس را بکشید و اینجا بگذارید، یا با کلیک کردن آن را انتخاب کنید</p>
              )}
              {errors.mainImage && <p className="mt-2 text-sm text-red-400">{errors.mainImage}</p>}
            </div>
          </div>

          {/* Detail Images Section */}
          <div>
            <h3 className="mb-3 font-medium">تصاویر پروژه (حداکثر ۱۰ عکس، هرکدام ۲ مگابایت)</h3>
            <div
              {...getDetailsRootProps()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-600 p-6 text-center transition-colors hover:border-blue-500"
              style={{ opacity: detailImages.length >= 10 ? 0.5 : 1 }}
            >
              <input {...getDetailsInputProps()} disabled={detailImages.length >= 10} />
              <p>{detailImages.length}/10 تصویر</p>
              <p className="text-sm text-gray-400">عکس را بکشید و اینجا بگذارید، و یا کلیک کنید</p>
              {errors.details && <p className="mt-2 text-sm text-red-400">{errors.details}</p>}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-4">
              {detailImages.map((file, index) => (
                <div key={file.name + file.size} className="group relative">
                  <img
                    src={detailImagePreviews[index] ?? ""}
                    alt={`Detail ${index + 1}`}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(setDetailImages, detailImages, index)}
                    className="absolute top-1 right-1 rounded-lg bg-red-500 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                    aria-label="حذف تصویر"
                  >
                    <BiTrash size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Videos Section */}
          <div>
            <h3 className="mb-3 font-medium">ویدیو‌ها (حداکثر ۳ ویدیو، هرکدام ۵۰ مگابایت)</h3>
            <div
              {...getVideosRootProps()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-gray-600 p-6 text-center transition-colors hover:border-blue-500"
              style={{ opacity: videos.length >= 3 ? 0.5 : 1 }}
            >
              <input {...getVideosInputProps()} disabled={videos.length >= 3} />
              <p>{videos.length}/3 ویدیو</p>
              <p className="text-sm text-gray-400">
                ویدیو را بکشید و اینجا بگذارید، و یا کلیک کنید
              </p>
              {errors.videos && <p className="mt-2 text-sm text-red-400">{errors.videos}</p>}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              {videos.map((file, index) => (
                <div
                  key={file.name + file.size}
                  className="group relative rounded-lg bg-gray-700 p-3"
                >
                  <video className="h-32 w-full rounded-lg object-cover">
                    <source src={videoPreviews[index] ?? ""} />
                  </video>
                  <button
                    type="button"
                    onClick={() => removeFile(setVideos, videos, index)}
                    className="absolute top-1 right-1 rounded-lg bg-red-500 p-2 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                    aria-label="حذف ویدیو"
                  >
                    <BiTrash size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="new-project-description" className="mb-2 block font-medium">
              توضیحات *
            </label>
            <textarea
              id="new-project-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              aria-label="توضیحات پروژه"
              className="w-full rounded-lg bg-gray-700 p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-400">{errors.description}</p>
            )}
          </div>

          {/* Form error */}
          {errors.form && <p className="text-sm text-red-400">{errors.form}</p>}

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-gray-600 px-6 py-2 transition-colors hover:bg-gray-500"
            >
              بستن
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-6 py-2 transition-colors hover:bg-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "در حال ذخیره..." : "ذخیره پروژه"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProject;
