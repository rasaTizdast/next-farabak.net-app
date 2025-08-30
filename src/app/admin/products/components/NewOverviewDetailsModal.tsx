import Image from "next/image";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { FiUpload } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

// NewOverviewDetailsModal component
const NewOverviewDetailsModal = ({ onClose }: { onClose: () => void }) => {
  const [items, setItems] = useState<
    {
      title: string;
      description: string;
      image: File | null;
      preview: string;
    }[]
  >([{ title: "", description: "", image: null, preview: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to handle adding a new item
  const addItem = () => {
    setItems([...items, { title: "", description: "", image: null, preview: "" }]);
  };

  // Function to handle removing an item
  const removeItem = (index: number) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };

  // Function to handle field changes
  const handleChange = (index: number, field: string, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  // Function to handle image selection
  const handleImageSelect = (index: number, file: File) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      updatedItems[index] = {
        ...updatedItems[index],
        image: file,
        preview: URL.createObjectURL(file),
      };
      return updatedItems;
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isValid = items.every(
      (item) => item.title.trim() !== "" && item.description.trim() !== "" && item.image !== null
    );

    if (!isValid) {
      toast.error("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    setIsSubmitting(true);
    toast.loading("در حال ایجاد توضیحات محصول...");

    try {
      // Convert images to base64
      const itemsWithBase64 = await Promise.all(
        items.map(async (item) => {
          // Skip items without an image (should not happen due to validation)
          if (!item.image) return null;

          return new Promise<{
            title: string;
            description: string;
            image: string | { base64: string; contentType: string; fileName: string };
          }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              // We already checked that item.image is not null above
              const image = item.image!;

              // Extract base name without extension to prevent duplicate extensions
              const fileName = image.name.includes(".")
                ? image.name.substring(0, image.name.lastIndexOf("."))
                : image.name;

              resolve({
                title: item.title,
                description: item.description,
                image: {
                  base64: (reader.result as string).split(",")[1],
                  contentType: image.type || "image/jpeg",
                  fileName: fileName,
                },
              });
            };
            // We're sure item.image is not null here since we checked above
            reader.readAsDataURL(item.image!);
          });
        })
      );

      // Filter out any null items (shouldn't happen if validation is working)
      const validItems = itemsWithBase64.filter((item) => item !== null);

      // Send to API
      const response = await fetch("/api/productOverviewDetails/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ overviewDetails: validItems }),
      });

      if (!response.ok) {
        throw new Error("خطا در ایجاد توضیحات محصول");
      }

      toast.dismiss();
      toast.success("توضیحات محصول با موفقیت ایجاد شد!");

      // Force a refresh of the overview details list
      // This will trigger a re-fetch of all overview details
      document.dispatchEvent(new CustomEvent("refreshOverviewDetails"));

      onClose();
    } catch (error) {
      console.error("Error creating overview details:", error);
      toast.dismiss();
      toast.error("خطا در ایجاد توضیحات محصول. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
      <div className="relative max-h-[90dvh] w-full max-w-6xl animate-fade-in overflow-y-scroll rounded-xl bg-gray-800 p-6 text-white shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold">توضیحات محصول جدید</h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {items.map((item, index) => (
              <ItemForm
                key={index}
                item={item}
                index={index}
                isSubmitting={isSubmitting}
                handleChange={handleChange}
                handleImageSelect={handleImageSelect}
                removeItem={removeItem}
                showRemoveButton={items.length > 1}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <button
              type="button"
              onClick={addItem}
              className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              disabled={isSubmitting}
            >
              افزودن آیتم جدید
            </button>

            <div className="flex justify-center gap-4">
              <button
                type="submit"
                className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "در حال ارسال..." : "ایجاد"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
                disabled={isSubmitting}
              >
                انصراف
              </button>
            </div>
          </div>
        </form>

        <div
          className="absolute right-4 top-4 cursor-pointer text-red-400 transition-all hover:text-red-500"
          onClick={onClose}
        >
          <IoIosClose size={50} />
        </div>
      </div>
    </div>
  );
};

// Create a separate component for each item form to safely use hooks
type ItemFormProps = {
  item: {
    title: string;
    description: string;
    image: File | null;
    preview: string;
  };
  index: number;
  isSubmitting: boolean;
  handleChange: (index: number, field: string, value: string) => void;
  handleImageSelect: (index: number, file: File) => void;
  removeItem: (index: number) => void;
  showRemoveButton: boolean;
};

const ItemForm = ({
  item,
  index,
  isSubmitting,
  handleChange,
  handleImageSelect,
  removeItem,
  showRemoveButton,
}: ItemFormProps) => {
  // We can safely use hooks here because this component is rendered directly in the list
  // Not conditionally or in a loop inside the component
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      handleImageSelect(index, acceptedFiles[0]);
    },
    [index, handleImageSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="relative rounded-lg bg-gray-900 p-4">
      {showRemoveButton && (
        <button
          type="button"
          onClick={() => removeItem(index)}
          className="absolute left-2 top-2 rounded-lg bg-red-500 hover:bg-red-600"
        >
          <IoIosClose size={25} />
        </button>
      )}

      <div className="mb-4">
        <label className="mb-2 block">عنوان</label>
        <input
          type="text"
          value={item.title}
          onChange={(e) => handleChange(index, "title", e.target.value)}
          className="w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white"
          placeholder="عنوان را وارد کنید"
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block">توضیحات</label>
        <textarea
          value={item.description}
          onChange={(e) => handleChange(index, "description", e.target.value)}
          className="min-h-[100px] w-full rounded-md border border-gray-600 bg-gray-700 p-2 text-white"
          placeholder="توضیحات را وارد کنید"
          disabled={isSubmitting}
        />
      </div>

      <div className="mb-4">
        <label className="mb-2 block">تصویر</label>
        <div
          {...getRootProps()}
          className={`cursor-pointer rounded-md border-2 border-dashed p-4 text-center transition-colors ${
            isDragActive
              ? "border-blue-400 bg-blue-900/20"
              : isDragReject
                ? "border-red-400 bg-red-900/20"
                : "border-gray-600 hover:border-blue-400 hover:bg-blue-900/10"
          } ${item.preview ? "border-green-500" : ""}`}
        >
          <input {...getInputProps()} disabled={isSubmitting} />

          {item.preview ? (
            <div className="space-y-2">
              <p className="text-green-400">تصویر انتخاب شد</p>
              <p className="text-sm text-gray-400">
                برای تغییر تصویر، کلیک کنید یا تصویر جدیدی را به اینجا بکشید
              </p>
            </div>
          ) : isDragActive ? (
            <p>فایل را اینجا رها کنید ...</p>
          ) : isDragReject ? (
            <p className="text-red-400">فقط فایل تصویر مجاز است!</p>
          ) : (
            <div className="space-y-2">
              <FiUpload className="mx-auto mb-2 text-3xl text-blue-400" />
              <p>برای انتخاب تصویر کلیک کنید یا تصویر را به اینجا بکشید</p>
              <p className="text-sm text-gray-400">
                فرمت‌های مجاز: JPG، PNG، WebP | (اندازه پیشنهادی 1920*1080)
              </p>
            </div>
          )}
        </div>

        {item.preview && (
          <div className="relative mt-4 h-48 w-full overflow-hidden rounded-md bg-gray-700">
            <Image
              height={192}
              width={250}
              src={item.preview}
              alt="پیش‌نمایش"
              className="h-full w-full object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NewOverviewDetailsModal;
