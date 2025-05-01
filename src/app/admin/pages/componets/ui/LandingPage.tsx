import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  FiX,
  FiPlus,
  FiTrash2,
  FiZoomIn,
  FiArrowUp,
  FiArrowDown,
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
const ImagePreview = ({
  imageUrl,
  onClose,
}: {
  imageUrl: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="relative max-w-4xl max-h-[90vh]">
      <img
        src={imageUrl}
        alt="Full size preview"
        className="max-w-full max-h-[90vh] object-contain rounded-lg"
      />
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
      >
        <FiX className="w-6 h-6" />
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
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-50">
    <div className="bg-gray-800 p-6 rounded-lg max-w-md">
      <h3 className="text-lg font-semibold mb-4">آیا مطمئن هستید؟</h3>
      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
        >
          لغو
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
        >
          حذف
        </button>
      </div>
    </div>
  </div>
);

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse space-y-6">
    {[...Array(2)].map((_, i) => (
      <div key={i} className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-32 bg-gray-700 rounded" />
          <div className="h-4 w-20 bg-gray-700 rounded" />
        </div>
        <div className="space-y-3">
          {[...Array(2)].map((_, j) => (
            <div
              key={j}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-4 space-x-4 flex-1">
                <div className="w-32 h-20 bg-gray-600 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-600 rounded w-3/4" />
                  <div className="h-3 bg-gray-600 rounded w-1/2" />
                </div>
              </div>
              <div className="w-10 h-10 bg-gray-600 rounded-lg" />
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
  <div className="relative flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all">
    <div className="flex items-center gap-4 space-x-4 flex-1">
      <div className="relative">
        <Image
          width={120}
          height={80}
          quality={100}
          src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/slider-imgs/${slider.image_URL}`}
          alt={slider.image_alt || "اسلایدر"}
          className="w-32 h-20 object-cover rounded-lg cursor-zoom-in"
          onClick={() =>
            onPreview(
              `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/slider-imgs/${slider.image_URL}`
            )
          }
        />
        <FiZoomIn
          size={20}
          className="absolute top-1 left-1 text-white bg-black/50 p-1 rounded"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate text-gray-300">{slider.link}</p>
        {slider.image_alt && (
          <p className="text-xs text-gray-400 mt-1">{slider.image_alt}</p>
        )}
      </div>
    </div>
    <button
      onClick={() => onDelete(slider.id)}
      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
      disabled={isDeleting}
    >
      {isDeleting ? (
        <span className="loading-dots">حذف</span>
      ) : (
        <FiTrash2 className="w-5 h-5 text-red-500" />
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
  <div className="bg-gray-800 p-5 rounded-lg mt-4">
    <h4 className="font-medium mb-4">اسلایدر جدید</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="space-y-1">
        <span className="text-sm text-gray-300">تصویر</span>
        <input
          type="file"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 file:text-gray-300 file:bg-gray-600 file:border-0 file:mr-2 file:px-3 file:py-1"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-gray-300">لینک</span>
        <input
          type="text"
          placeholder="https://example.com"
          value={newSlider.link || ""}
          onChange={(e) => onFieldChange("link", e.target.value)}
          className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
        />
      </label>
      <label className="space-y-1 md:col-span-2">
        <span className="text-sm text-gray-300">متن جایگزین (اختیاری)</span>
        <input
          type="text"
          placeholder="توضیح تصویر"
          value={newSlider.image_alt || ""}
          onChange={(e) => onFieldChange("image_alt", e.target.value)}
          className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
        />
      </label>
    </div>
    <button
      onClick={onSubmit}
      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      disabled={isUploading}
    >
      {isUploading ? (
        <span className="loading-dots">در حال آپلود</span>
      ) : (
        <>
          <FiPlus className="w-5 h-5" />
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
  sliderFile,
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
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-xl font-semibold">اسلایدرها</h3>
      <span className="text-sm text-gray-400">{sliders.length} آیتم</span>
    </div>

    <div className="space-y-3 mb-6">
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
      onFieldChange={(field, value) =>
        setNewSlider((prev) => ({ ...prev, [field]: value }))
      }
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
  <div className="relative flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all">
    <div className="flex items-center gap-4 space-x-4 flex-1">
      <div className="relative">
        <Image
          width={120}
          height={80}
          quality={100}
          src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${product.image}`}
          alt={product.title}
          className="w-32 h-20 object-cover rounded-lg cursor-zoom-in"
          onClick={() =>
            onPreview(
              `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${product.image}`
            )
          }
        />
        <FiZoomIn
          size={20}
          className="absolute top-1 left-1 text-white bg-black/50 p-1 rounded"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate text-white">{product.title}</h4>
        <p className="text-sm text-gray-300 truncate">{product.description}</p>
        <div className="flex items-center mt-2">
          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
            ترتیب: {product.order}
          </span>
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300 truncate mr-3"
          >
            {product.link}
          </a>
        </div>
      </div>
    </div>

    <div className="flex items-center">
      <div className="flex flex-col mr-2">
        <button
          onClick={() => onMoveUp(product.id, product.order)}
          disabled={isFirst}
          className={`p-1 mb-1 rounded-md ${
            isFirst
              ? "text-gray-500"
              : "hover:bg-gray-700 text-gray-400 hover:text-white"
          }`}
        >
          <FiArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => onMoveDown(product.id, product.order)}
          disabled={isLast}
          className={`p-1 rounded-md ${
            isLast
              ? "text-gray-500"
              : "hover:bg-gray-700 text-gray-400 hover:text-white"
          }`}
        >
          <FiArrowDown className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={() => onDelete(product.id)}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        disabled={isDeleting}
      >
        {isDeleting ? (
          <span className="loading-dots">حذف</span>
        ) : (
          <FiTrash2 className="w-5 h-5 text-red-500" />
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
  <div className="bg-gray-800 p-5 rounded-lg mt-4">
    <h4 className="font-medium mb-4">محصول نمایشی جدید</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="space-y-1">
        <span className="text-sm text-gray-300">تصویر</span>
        <input
          type="file"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 file:text-gray-300 file:bg-gray-600 file:border-0 file:mr-2 file:px-3 file:py-1"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-gray-300">عنوان</span>
        <input
          type="text"
          placeholder="عنوان محصول"
          value={newProduct.title || ""}
          onChange={(e) => onFieldChange("title", e.target.value)}
          className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
        />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-gray-300">ترتیب نمایش</span>
        <div className="flex items-center">
          <input
            type="text"
            value={`${nextOrder} (تنظیم خودکار)`}
            disabled
            className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 text-gray-400"
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
          className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
        />
      </label>
      <label className="space-y-1 md:col-span-2">
        <span className="text-sm text-gray-300">توضیحات</span>
        <textarea
          placeholder="توضیحات محصول"
          value={newProduct.description || ""}
          onChange={(e) => onFieldChange("description", e.target.value)}
          className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 resize-none h-24"
        />
      </label>
    </div>
    <button
      onClick={onSubmit}
      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
      disabled={isUploading}
    >
      {isUploading ? (
        <span className="loading-dots">در حال آپلود</span>
      ) : (
        <>
          <FiPlus className="w-5 h-5" />
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
  setNewShowcaseProduct: React.Dispatch<
    React.SetStateAction<Partial<ShowcaseProduct>>
  >;
  productFile: File | null;
  setProductFile: React.Dispatch<React.SetStateAction<File | null>>;
  isUploadingProduct: boolean;
  handleAddShowcaseProduct: () => Promise<void>;
  handleMoveProductUp: (id: number, currentOrder: number) => void;
  handleMoveProductDown: (id: number, currentOrder: number) => void;
}) => {
  // Sort products by order
  const sortedProducts = [...products].sort((a, b) => a.order - b.order);

  // Calculate next order (highest order + 1)
  const nextOrder =
    products.length > 0 ? Math.max(...products.map((p) => p.order)) + 1 : 1;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">محصولات نمایشی</h3>
        <span className="text-sm text-gray-400">{products.length} آیتم</span>
      </div>

      <div className="space-y-3 mb-6">
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
  const [showcaseProducts, setShowcaseProducts] = useState<ShowcaseProduct[]>(
    []
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "slider" | "product";
    id: number;
  } | null>(null);
  const [newSlider, setNewSlider] = useState<Partial<Slider>>({});
  const [newShowcaseProduct, setNewShowcaseProduct] = useState<
    Partial<ShowcaseProduct>
  >({});
  const [sliderFile, setSliderFile] = useState<File | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUploadingSlider, setIsUploadingSlider] = useState<boolean>(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState<boolean>(false);
  const [isDeletingSlider, setIsDeletingSlider] = useState<number | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState<number | null>(
    null
  );
  const [isUpdatingOrder, setIsUpdatingOrder] = useState<boolean>(false);

  // Fetch sliders and showcase products on component mount
  useEffect(() => {
    fetchSliders();
    fetchShowcaseProducts();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await axios.get("/api/landingPage/sliders");
      setSliders(response.data);
    } catch (error) {
      toast.error("خطا در دریافت اسلایدرها.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShowcaseProducts = async () => {
    try {
      const response = await axios.get("/api/landingPage/showcase_products");
      setShowcaseProducts(response.data);
    } catch (error) {
      toast.error("محصولات نمایشی یافت نشد");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSlider = async () => {
    try {
      if (!sliderFile) {
        toast.error("لطفا یک فایل انتخاب کنید.");
        return;
      }

      setIsUploadingSlider(true);

      const formData = new FormData();
      formData.append("file", sliderFile);
      formData.append("image_alt", newSlider.image_alt || "");
      formData.append("link", newSlider.link || "");

      const response = await axios.post("/api/landingPage/sliders", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSliders([...sliders, response.data]);
      setNewSlider({});
      setSliderFile(null);
      toast.success("اسلایدر با موفقیت اضافه شد.");
    } catch (error) {
      toast.error("خطا در اضافه کردن اسلایدر.");
    } finally {
      setIsUploadingSlider(false);
    }
  };

  const handleAddShowcaseProduct = async () => {
    try {
      if (!productFile) {
        toast.error("لطفا یک فایل انتخاب کنید.");
        return;
      }

      setIsUploadingProduct(true);

      // Always use the next order value (highest + 1) to avoid conflicts
      const nextOrder = showcaseProducts.length > 0
        ? Math.max(...showcaseProducts.map((p) => p.order)) + 1
        : 1;

      const formData = new FormData();
      formData.append("file", productFile);
      formData.append("title", newShowcaseProduct.title || "");
      formData.append("description", newShowcaseProduct.description || "");
      formData.append("order", nextOrder.toString());
      formData.append("link", newShowcaseProduct.link || "");

      const response = await axios.post(
        "/api/landingPage/showcase_products",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setShowcaseProducts([...showcaseProducts, response.data]);
      setNewShowcaseProduct({});
      setProductFile(null);
      toast.success("محصول نمایشی با موفقیت اضافه شد.");
    } catch (error) {
      toast.error("خطا در اضافه کردن محصول نمایشی.");
    } finally {
      setIsUploadingProduct(false);
    }
  };

  const handleDeleteSlider = async (id: number) => {
    try {
      setIsDeletingSlider(id);
      await axios.delete(`/api/landingPage/sliders/${id}`);
      setSliders(sliders.filter((slider) => slider.id !== id));
      toast.success("اسلایدر با موفقیت حذف شد.");
    } catch (error) {
      toast.error("خطا در حذف اسلایدر.");
    } finally {
      setIsDeletingSlider(null);
    }
  };

  const handleDeleteShowcaseProduct = async (id: number) => {
    try {
      setIsDeletingProduct(id);
      await axios.delete(`/api/landingPage/showcase_products/${id}`);
      setShowcaseProducts(
        showcaseProducts.filter((product) => product.id !== id)
      );
      toast.success("محصول نمایشی با موفقیت حذف شد.");
    } catch (error) {
      toast.error("خطا در حذف محصول نمایشی.");
    } finally {
      setIsDeletingProduct(null);
    }
  };

  // New function to update product order
  const updateProductOrder = async (id: number, newOrder: number) => {
    try {
      const response = await axios.patch(`/api/landingPage/showcase_products/${id}`, {
        order: newOrder,
      });

      return response.data;
    } catch (error) {
      console.error("Error updating product order:", error);
      throw error;
    }
  };

  // Function to handle moving product up (decreasing order)
  const handleMoveProductUp = async (id: number, currentOrder: number) => {
    try {
      setIsUpdatingOrder(true);
      // Find the product with the next lower order
      const sortedProducts = [...showcaseProducts].sort(
        (a, b) => a.order - b.order
      );
      const currentIndex = sortedProducts.findIndex((p) => p.id === id);

      if (currentIndex > 0) {
        const prevProduct = sortedProducts[currentIndex - 1];
        const tempOrder = -9999; // Use a temporary order that's unlikely to conflict

        try {
          // Step 1: Move the current product to a temporary order
          await updateProductOrder(id, tempOrder);
          
          // Step 2: Move the previous product to the current product's original order
          await updateProductOrder(prevProduct.id, currentOrder);
          
          // Step 3: Move the current product to the previous product's original order
          await updateProductOrder(id, prevProduct.order);
          
          // Update local state to reflect the changes
          setShowcaseProducts(prevProducts => 
            prevProducts.map(product => {
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
        } catch (error) {
          toast.error("خطا در تغییر ترتیب محصول.");
          console.error("Error in handleMoveProductUp:", error);
          
          // Refresh data from server to ensure UI is in sync
          fetchShowcaseProducts();
        }
      }
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Function to handle moving product down (increasing order)
  const handleMoveProductDown = async (id: number, currentOrder: number) => {
    try {
      setIsUpdatingOrder(true);
      // Find the product with the next higher order
      const sortedProducts = [...showcaseProducts].sort(
        (a, b) => a.order - b.order
      );
      const currentIndex = sortedProducts.findIndex((p) => p.id === id);

      if (currentIndex < sortedProducts.length - 1) {
        const nextProduct = sortedProducts[currentIndex + 1];
        const tempOrder = -9999; // Use a temporary order that's unlikely to conflict

        try {
          // Step 1: Move the current product to a temporary order
          await updateProductOrder(id, tempOrder);
          
          // Step 2: Move the next product to the current product's original order
          await updateProductOrder(nextProduct.id, currentOrder);
          
          // Step 3: Move the current product to the next product's original order
          await updateProductOrder(id, nextProduct.order);
          
          // Update local state to reflect the changes
          setShowcaseProducts(prevProducts => 
            prevProducts.map(product => {
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
        } catch (error) {
          toast.error("خطا در تغییر ترتیب محصول.");
          console.error("Error in handleMoveProductDown:", error);
          
          // Refresh data from server to ensure UI is in sync
          fetchShowcaseProducts();
        }
      }
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  // Handler for confirm delete dialog
  const handleConfirmDelete = (type: "slider" | "product", id: number) => {
    setConfirmDelete({ type, id });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-40">
      {/* Image Preview */}
      {selectedImage && (
        <ImagePreview
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
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

      <div className="bg-gray-900 text-gray-200 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-auto relative">
        <div className="flex justify-between items-center mb-6 bg-gray-900 py-2">
          <h2 className="text-2xl font-bold">ویرایش صفحه اصلی</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <FiX className="w-6 h-6 text-red-400 hover:text-red-500 transition-all" />
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
