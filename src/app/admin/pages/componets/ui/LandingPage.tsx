import Image from "next/image";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiZoomIn,
  FiArrowUp,
  FiArrowDown,
  FiAlertTriangle,
} from "react-icons/fi";

type Slider = {
  id: number;
  image_URL: string;
  image_alt?: string;
  link: string;
};

type ShowcaseProduct = {
  id: number;
  title: string;
  description: string;
  order: number;
  image: string;
  link: string;
  productProductId?: number;
};

type ActivityEditModalProps = {
  onClose: () => void;
};

// Image Preview Component
const ImagePreview = ({ imageUrl, onClose }: { imageUrl: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="relative max-h-[90vh] max-w-4xl">
      <img
        src={imageUrl}
        alt="Full size preview"
        className="max-h-[90vh] max-w-full rounded-lg object-contain"
      />
      <button
        onClick={onClose}
        className="absolute left-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/80"
      >
        <FiX className="h-6 w-6" />
      </button>
    </div>
  </div>
);

// Confirmation Dialog Component
const ConfirmationDialog = ({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
    <div className="animate-fadeIn w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-8 text-gray-200 shadow-xl">
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-4 rounded-full bg-red-500/20 p-3">
          <FiAlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="mb-2 text-xl font-bold">آیا مطمئن هستید؟</h3>
        <p className="text-sm text-gray-400">
          این عملیات قابل بازگشت نیست و داده‌های حذف شده قابل بازیابی نخواهند بود.
        </p>
      </div>
      <div className="mt-2 flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg bg-gray-700 px-5 py-2.5 font-medium transition-colors hover:bg-gray-600"
        >
          انصراف
        </button>
        <button
          onClick={onConfirm}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 font-medium text-white transition-colors hover:bg-red-700"
        >
          <FiTrash2 className="h-4 w-4" />
          تأیید حذف
        </button>
      </div>
    </div>
  </div>
);

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="rounded-lg bg-gray-800 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-32 rounded bg-gray-700" />
          <div className="h-4 w-20 rounded bg-gray-700" />
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, j) => (
            <div key={j} className="flex items-center justify-between rounded-lg bg-gray-700 p-4">
              <div className="flex flex-1 items-center gap-4 space-x-4">
                <div className="h-20 w-32 rounded-lg bg-gray-600" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-600" />
                  <div className="h-3 w-1/2 rounded bg-gray-600" />
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-gray-600" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Slider Item Component
const SliderItem = ({
  slider,
  onPreview,
  onDelete,
  isDeleting,
}: {
  slider: Slider;
  onPreview: (url: string) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}) => (
  <div className="relative flex items-center justify-between rounded-lg bg-gray-800 p-4 shadow-md transition-all hover:shadow-lg">
    <div className="flex flex-1 items-center gap-4 space-x-4">
      <div className="relative">
        <Image
          width={120}
          height={80}
          quality={100}
          src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/slider-imgs/${slider.image_URL}`}
          alt={slider.image_alt || "اسلایدر"}
          className="h-20 w-32 cursor-zoom-in rounded-lg object-cover"
          onClick={() =>
            onPreview(`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/slider-imgs/${slider.image_URL}`)
          }
        />
        <FiZoomIn size={20} className="absolute left-1 top-1 rounded bg-black/50 p-1 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-gray-300">{slider.link}</p>
        {slider.image_alt && <p className="mt-1 text-xs text-gray-400">{slider.image_alt}</p>}
      </div>
    </div>
    <button
      onClick={() => onDelete(slider.id)}
      className="rounded-lg p-2 transition-colors hover:bg-gray-700"
      disabled={isDeleting}
    >
      {isDeleting ? (
        <span className="loading-dots">حذف</span>
      ) : (
        <FiTrash2 className="h-5 w-5 text-red-500" />
      )}
    </button>
  </div>
);

// New Slider Form Component
const NewSliderForm = ({
  isUploading,
  onFileChange,
  newSlider,
  onFieldChange,
  onSubmit,
}: {
  isUploading: boolean;
  onFileChange: (file: File | null) => void;
  newSlider: Partial<Slider>;
  onFieldChange: (field: string, value: string) => void;
  onSubmit: () => void;
}) => (
  <div className="mt-4 rounded-lg bg-gray-800 p-5">
    <h4 className="mb-4 font-medium">اسلایدر جدید</h4>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <label className="space-y-1">
        <span className="text-sm text-gray-300">تصویر</span>
        <input
          type="file"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 file:mr-2 file:border-0 file:bg-gray-600 file:px-3 file:py-1 file:text-gray-300"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-gray-300">لینک</span>
        <input
          type="text"
          placeholder="https://example.com"
          value={newSlider.link || ""}
          onChange={(e) => onFieldChange("link", e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2"
        />
      </label>
      <label className="space-y-1 md:col-span-2">
        <span className="text-sm text-gray-300">متن جایگزین (اختیاری)</span>
        <input
          type="text"
          placeholder="توضیح تصویر"
          value={newSlider.image_alt || ""}
          onChange={(e) => onFieldChange("image_alt", e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2"
        />
      </label>
    </div>
    <button
      onClick={onSubmit}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      disabled={isUploading}
    >
      {isUploading ? (
        <span className="loading-dots">در حال آپلود</span>
      ) : (
        <>
          <FiPlus className="h-5 w-5" />
          افزودن اسلایدر
        </>
      )}
    </button>
  </div>
);

// Slider Section Component
const SliderSection = ({
  sliders,
  onPreview,
  onConfirmDelete,
  isDeletingSlider,
  newSlider,
  setNewSlider,
  setSliderFile,
  isUploadingSlider,
  handleAddSlider,
}: {
  sliders: Slider[];
  onPreview: (url: string) => void;
  onConfirmDelete: (type: "slider" | "product", id: number) => void;
  isDeletingSlider: number | null;
  newSlider: Partial<Slider>;
  setNewSlider: React.Dispatch<React.SetStateAction<Partial<Slider>>>;
  sliderFile: File | null;
  setSliderFile: React.Dispatch<React.SetStateAction<File | null>>;
  isUploadingSlider: boolean;
  handleAddSlider: () => Promise<void>;
}) => (
  <section className="mb-8">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-xl font-semibold">اسلایدرها</h3>
      <span className="text-sm text-gray-400">{sliders.length} آیتم</span>
    </div>

    <div className="mb-6 space-y-3">
      {sliders.map((slider) => (
        <SliderItem
          key={slider.id}
          slider={slider}
          onPreview={onPreview}
          onDelete={(id) => onConfirmDelete("slider", id)}
          isDeleting={isDeletingSlider === slider.id}
        />
      ))}
    </div>

    <NewSliderForm
      isUploading={isUploadingSlider}
      onFileChange={setSliderFile}
      newSlider={newSlider}
      onFieldChange={(field, value) => setNewSlider((prev) => ({ ...prev, [field]: value }))}
      onSubmit={handleAddSlider}
    />
  </section>
);

// Showcase Product Item Component
const ShowcaseProductItem = ({
  product,
  onPreview,
  onDelete,
  isDeleting,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  product: ShowcaseProduct;
  onPreview: (url: string) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
  onMoveUp: (id: number, currentOrder: number) => void;
  onMoveDown: (id: number, currentOrder: number) => void;
  isFirst: boolean;
  isLast: boolean;
}) => (
  <div className="relative flex items-center justify-between rounded-lg bg-gray-800 p-4 shadow-md transition-all hover:shadow-lg">
    <div className="flex flex-1 items-center gap-4 space-x-4">
      <div className="relative">
        <Image
          width={120}
          height={80}
          quality={100}
          src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${product.image}`}
          alt={product.title}
          className="h-20 w-32 cursor-zoom-in rounded-lg object-cover"
          onClick={() => onPreview(`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${product.image}`)}
        />
        <FiZoomIn size={20} className="absolute left-1 top-1 rounded bg-black/50 p-1 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-white">{product.title}</h4>
        <p className="truncate text-sm text-gray-300">{product.description}</p>
        <div className="mt-2 flex items-center">
          <span className="rounded bg-gray-700 px-2 py-1 text-xs">ترتیب: {product.order}</span>
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-3 truncate text-xs text-blue-400 hover:text-blue-300"
          >
            {product.link}
          </a>
        </div>
      </div>
    </div>

    <div className="flex items-center">
      <div className="mr-2 flex flex-col">
        <button
          onClick={() => onMoveUp(product.id, product.order)}
          disabled={isFirst}
          className={`mb-1 rounded-md p-1 ${
            isFirst ? "text-gray-500" : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <FiArrowUp className="h-4 w-4" />
        </button>
        <button
          onClick={() => onMoveDown(product.id, product.order)}
          disabled={isLast}
          className={`rounded-md p-1 ${
            isLast ? "text-gray-500" : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <FiArrowDown className="h-4 w-4" />
        </button>
      </div>

      <button
        onClick={() => onDelete(product.id)}
        className="rounded-lg p-2 transition-colors hover:bg-gray-700"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <span className="loading-dots">حذف</span>
        ) : (
          <FiTrash2 className="h-5 w-5 text-red-500" />
        )}
      </button>
    </div>
  </div>
);

// New Showcase Product Form Component
const NewShowcaseProductForm = ({
  isUploading,
  onFileChange,
  newProduct,
  onFieldChange,
  onSubmit,
  nextOrder,
}: {
  isUploading: boolean;
  onFileChange: (file: File | null) => void;
  newProduct: Partial<ShowcaseProduct>;
  onFieldChange: (field: string, value: string | number) => void;
  onSubmit: () => void;
  nextOrder: number;
}) => (
  <div className="mt-4 rounded-lg bg-gray-800 p-5">
    <h4 className="mb-4 font-medium">محصول نمایشی جدید</h4>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <label className="space-y-1">
        <span className="text-sm text-gray-300">تصویر</span>
        <input
          type="file"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 file:mr-2 file:border-0 file:bg-gray-600 file:px-3 file:py-1 file:text-gray-300"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-gray-300">عنوان</span>
        <input
          type="text"
          placeholder="عنوان محصول"
          value={newProduct.title || ""}
          onChange={(e) => onFieldChange("title", e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-gray-300">ترتیب نمایش</span>
        <div className="flex items-center">
          <input
            type="text"
            value={`${nextOrder} (تنظیم خودکار)`}
            readOnly
            disabled
            className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2 text-gray-400"
          />
        </div>
      </label>
      <label className="space-y-1">
        <span className="text-sm text-gray-300">لینک</span>
        <input
          type="text"
          placeholder="https://farabak.net"
          value={newProduct.link || ""}
          onChange={(e) => onFieldChange("link", e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2"
        />
      </label>
      <label className="space-y-1 md:col-span-2">
        <span className="text-sm text-gray-300">توضیحات</span>
        <textarea
          placeholder="توضیحات محصول"
          value={newProduct.description || ""}
          onChange={(e) => onFieldChange("description", e.target.value)}
          className="h-24 w-full resize-none rounded-lg border border-gray-600 bg-gray-700 p-2"
        />
      </label>
    </div>
    <button
      onClick={onSubmit}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      disabled={isUploading}
    >
      {isUploading ? (
        <span className="loading-dots">در حال آپلود</span>
      ) : (
        <>
          <FiPlus className="h-5 w-5" />
          افزودن محصول نمایشی
        </>
      )}
    </button>
  </div>
);

// Showcase Product Section Component
const ShowcaseProductSection = ({
  products,
  onPreview,
  onConfirmDelete,
  isDeletingProduct,
  newShowcaseProduct,
  setNewShowcaseProduct,
  setProductFile,
  isUploadingProduct,
  handleAddShowcaseProduct,
  handleMoveProductUp,
  handleMoveProductDown,
}: {
  products: ShowcaseProduct[];
  onPreview: (url: string) => void;
  onConfirmDelete: (type: "slider" | "product", id: number) => void;
  isDeletingProduct: number | null;
  newShowcaseProduct: Partial<ShowcaseProduct>;
  setNewShowcaseProduct: React.Dispatch<React.SetStateAction<Partial<ShowcaseProduct>>>;
  productFile: File | null;
  setProductFile: React.Dispatch<React.SetStateAction<File | null>>;
  isUploadingProduct: boolean;
  handleAddShowcaseProduct: () => Promise<void>;
  handleMoveProductUp: (id: number, currentOrder: number) => void;
  handleMoveProductDown: (id: number, currentOrder: number) => void;
}) => {
  // Sort products by order
  const sortedProducts = products.toSorted((a, b) => a.order - b.order);

  // Calculate next order (highest order + 1)
  const nextOrder = products.length > 0 ? Math.max(...products.map((p) => p.order)) + 1 : 1;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-semibold">محصولات نمایشی</h3>
        <span className="text-sm text-gray-400">{products.length} آیتم</span>
      </div>

      <div className="mb-6 space-y-3">
        {sortedProducts.map((product, index) => (
          <ShowcaseProductItem
            key={product.id}
            product={product}
            onPreview={onPreview}
            onDelete={(id) => onConfirmDelete("product", id)}
            isDeleting={isDeletingProduct === product.id}
            onMoveUp={handleMoveProductUp}
            onMoveDown={handleMoveProductDown}
            isFirst={index === 0}
            isLast={index === sortedProducts.length - 1}
          />
        ))}
      </div>

      <NewShowcaseProductForm
        isUploading={isUploadingProduct}
        onFileChange={setProductFile}
        newProduct={newShowcaseProduct}
        onFieldChange={(field, value) =>
          setNewShowcaseProduct((prev) => ({ ...prev, [field]: value }))
        }
        onSubmit={handleAddShowcaseProduct}
        nextOrder={nextOrder}
      />
    </section>
  );
};

// Main Component
const LandingPageEditor: React.FC<ActivityEditModalProps> = ({ onClose }) => {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [showcaseProducts, setShowcaseProducts] = useState<ShowcaseProduct[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "slider" | "product";
    id: number;
  } | null>(null);
  const [newSlider, setNewSlider] = useState<Partial<Slider>>({});
  const [newShowcaseProduct, setNewShowcaseProduct] = useState<Partial<ShowcaseProduct>>({});
  const [sliderFile, setSliderFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadingSlider, setIsUploadingSlider] = useState<boolean>(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState<boolean>(false);
  const [isDeletingSlider, setIsDeletingSlider] = useState<number | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState<number | null>(null);

  // Fetch sliders and showcase products on component mount
  const { data: slidersData } = useApiFetch("/api/landingPage/sliders");
  const { data: productsData } = useApiFetch("/api/landingPage/showcase_products");
  const { mutate: deleteSliderMutate } = useApiMutation("delete");
  const { mutate: deleteProductMutate } = useApiMutation("delete");
  const { mutate: updateOrderMutate } = useApiMutation("patch");

  useEffect(() => {
    if (slidersData) {
      setSliders(slidersData);
      setIsLoading(false);
    }
  }, [slidersData]);

  useEffect(() => {
    if (productsData) {
      setShowcaseProducts(productsData);
      setIsLoading(false);
    }
  }, [productsData]);

  const handleAddSlider = async () => {
    if (!sliderFile) {
      toast.error("لطفا یک فایل انتخاب کنید.");
      return;
    }

    setIsUploadingSlider(true);

    const formData = new FormData();
    formData.append("file", sliderFile);
    formData.append("image_alt", newSlider.image_alt || "");
    formData.append("link", newSlider.link || "");

    const res = await fetch("/api/landingPage/sliders", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setSliders([...sliders, data]);
      setNewSlider({});
      setSliderFile(null);
      toast.success("اسلایدر با موفقیت اضافه شد.");
    } else {
      toast.error("خطا در اضافه کردن اسلایدر.");
    }
    setIsUploadingSlider(false);
  };

  const handleAddShowcaseProduct = async () => {
    if (!productFile) {
      toast.error("لطفا یک فایل انتخاب کنید.");
      return;
    }

    setIsUploadingProduct(true);

    const nextOrder =
      showcaseProducts.length > 0 ? Math.max(...showcaseProducts.map((p) => p.order)) + 1 : 1;

    const formData = new FormData();
    formData.append("file", productFile);
    formData.append("title", newShowcaseProduct.title || "");
    formData.append("description", newShowcaseProduct.description || "");
    formData.append("order", nextOrder.toString());
    formData.append("link", newShowcaseProduct.link || "");

    const res = await fetch("/api/landingPage/showcase_products", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setShowcaseProducts([...showcaseProducts, data]);
      setNewShowcaseProduct({});
      setProductFile(null);
      toast.success("محصول نمایشی با موفقیت اضافه شد.");
    } else {
      toast.error("خطا در اضافه کردن محصول نمایشی.");
    }
    setIsUploadingProduct(false);
  };

  const handleDeleteSlider = async (id: number) => {
    setIsDeletingSlider(id);
    const res = await deleteSliderMutate(`/api/landingPage/sliders/${id}`);
    if (res) {
      setSliders(sliders.filter((slider) => slider.id !== id));
      toast.success("اسلایدر با موفقیت حذف شد.");
    } else {
      toast.error("خطا در حذف اسلایدر.");
    }
    setIsDeletingSlider(null);
  };

  const handleDeleteShowcaseProduct = async (id: number) => {
    setIsDeletingProduct(id);
    const res = await deleteProductMutate(`/api/landingPage/showcase_products/${id}`);
    if (res) {
      setShowcaseProducts(showcaseProducts.filter((product) => product.id !== id));
      toast.success("محصول نمایشی با موفقیت حذف شد.");
    } else {
      toast.error("خطا در حذف محصول نمایشی.");
    }
    setIsDeletingProduct(null);
  };

  const updateProductOrder = async (id: number, newOrder: number) => {
    return await updateOrderMutate(`/api/landingPage/showcase_products/${id}`, {
      order: newOrder,
    });
  };

  // Function to handle moving product up (decreasing order)
  const handleMoveProductUp = async (id: number, currentOrder: number) => {
    const sortedProducts = showcaseProducts.toSorted((a, b) => a.order - b.order);
    const currentIndex = sortedProducts.findIndex((p) => p.id === id);

    if (currentIndex > 0) {
      const prevProduct = sortedProducts[currentIndex - 1];
      const tempOrder = -9999;

      const step1 = await updateProductOrder(id, tempOrder);
      if (!step1) { toast.error("خطا در تغییر ترتیب محصول."); return; }

      const step2 = await updateProductOrder(prevProduct.id, currentOrder);
      if (!step2) { toast.error("خطا در تغییر ترتیب محصول."); return; }

      const step3 = await updateProductOrder(id, prevProduct.order);
      if (!step3) { toast.error("خطا در تغییر ترتیب محصول."); return; }

      setShowcaseProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product.id === id) {
            return { ...product, order: prevProduct.order };
          }
          if (product.id === prevProduct.id) {
            return { ...product, order: currentOrder };
          }
          return product;
        })
      );

      toast.success("ترتیب محصول با موفقیت تغییر کرد.");
    }
  };

  // Function to handle moving product down (increasing order)
  const handleMoveProductDown = async (id: number, currentOrder: number) => {
    const sortedProducts = showcaseProducts.toSorted((a, b) => a.order - b.order);
    const currentIndex = sortedProducts.findIndex((p) => p.id === id);

    if (currentIndex < sortedProducts.length - 1) {
      const nextProduct = sortedProducts[currentIndex + 1];
      const tempOrder = -9999;

      const step1 = await updateProductOrder(id, tempOrder);
      if (!step1) { toast.error("خطا در تغییر ترتیب محصول."); return; }

      const step2 = await updateProductOrder(nextProduct.id, currentOrder);
      if (!step2) { toast.error("خطا در تغییر ترتیب محصول."); return; }

      const step3 = await updateProductOrder(id, nextProduct.order);
      if (!step3) { toast.error("خطا در تغییر ترتیب محصول."); return; }

      setShowcaseProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (product.id === id) {
            return { ...product, order: nextProduct.order };
          }
          if (product.id === nextProduct.id) {
            return { ...product, order: currentOrder };
          }
          return product;
        })
      );

      toast.success("ترتیب محصول با موفقیت تغییر کرد.");
    }
  };

  // Handler for confirm delete dialog
  const handleConfirmDelete = (type: "slider" | "product", id: number) => {
    setConfirmDelete({ type, id });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      {/* Image Preview */}
      {selectedImage && (
        <ImagePreview imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {/* Confirmation Dialog */}
      {confirmDelete && (
        <ConfirmationDialog
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            if (confirmDelete.type === "slider") {
              handleDeleteSlider(confirmDelete.id);
            } else {
              handleDeleteShowcaseProduct(confirmDelete.id);
            }
            setConfirmDelete(null);
          }}
        />
      )}

      <div className="relative max-h-[95vh] w-full max-w-4xl overflow-auto rounded-lg bg-gray-900 p-6 text-gray-200 shadow-xl">
        <div className="mb-6 flex items-center justify-between bg-gray-900 py-2">
          <h2 className="text-2xl font-bold">ویرایش صفحه اصلی</h2>
          <button onClick={onClose} className="rounded-lg p-2 transition-colors hover:bg-gray-800">
            <FiX className="h-6 w-6 text-red-400 transition-all hover:text-red-500" />
          </button>
        </div>

        {isLoading ? (
          <SkeletonLoader />
        ) : (
          <div className="space-y-8">
            {/* Slider Section */}
            <SliderSection
              sliders={sliders}
              onPreview={setSelectedImage}
              onConfirmDelete={handleConfirmDelete}
              isDeletingSlider={isDeletingSlider}
              newSlider={newSlider}
              setNewSlider={setNewSlider}
              sliderFile={sliderFile}
              setSliderFile={setSliderFile}
              isUploadingSlider={isUploadingSlider}
              handleAddSlider={handleAddSlider}
            />

            {/* Showcase Products Section */}
            <ShowcaseProductSection
              products={showcaseProducts}
              onPreview={setSelectedImage}
              onConfirmDelete={handleConfirmDelete}
              isDeletingProduct={isDeletingProduct}
              newShowcaseProduct={newShowcaseProduct}
              setNewShowcaseProduct={setNewShowcaseProduct}
              productFile={productFile}
              setProductFile={setProductFile}
              isUploadingProduct={isUploadingProduct}
              handleAddShowcaseProduct={handleAddShowcaseProduct}
              handleMoveProductUp={handleMoveProductUp}
              handleMoveProductDown={handleMoveProductDown}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPageEditor;
