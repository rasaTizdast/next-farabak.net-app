import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";
import { FiX, FiPlus, FiTrash2, FiZoomIn } from "react-icons/fi";

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

  // Add this new function for image preview
  const openImagePreview = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  // Add this new confirmation dialog component
  const ConfirmationDialog = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md">
        <h3 className="text-lg font-semibold mb-4">آیا مطمئن هستید؟</h3>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setConfirmDelete(null)}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            لغو
          </button>
          <button
            onClick={() => {
              if (confirmDelete?.type === "slider") {
                handleDeleteSlider(confirmDelete.id);
              } else {
                handleDeleteShowcaseProduct(confirmDelete?.id!);
              }
              setConfirmDelete(null);
            }}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );

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

      const formData = new FormData();
      formData.append("file", productFile);
      formData.append("title", newShowcaseProduct.title || "");
      formData.append("description", newShowcaseProduct.description || "");
      formData.append("order", newShowcaseProduct.order?.toString() || "0");
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

  // Update the slider item JSX
  const SliderItem = ({ slider }: { slider: Slider }) => (
    <div className="group relative flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all">
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
              openImagePreview(
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
        onClick={() => setConfirmDelete({ type: "slider", id: slider.id })}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        disabled={isDeletingSlider === slider.id}
      >
        {isDeletingSlider === slider.id ? (
          <span className="loading-dots">حذف</span>
        ) : (
          <FiTrash2 className="w-5 h-5 text-red-500" />
        )}
      </button>
    </div>
  );

  // Update the showcase product item JSX
  const ShowcaseProductItem = ({ product }: { product: ShowcaseProduct }) => (
    <div className="group relative flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all">
      <div className="flex items-center space-x-4 flex-1">
        <div className="relative">
          <Image
            width={120}
            height={80}
            quality={100}
            src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${product.image}`}
            alt={product.title}
            className="w-32 h-20 object-cover rounded-lg cursor-zoom-in"
            onClick={() =>
              openImagePreview(
                `${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${product.image}`
              )
            }
          />
          <FiZoomIn className="absolute top-1 left-1 text-white bg-black/50 p-1 rounded" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium truncate">{product.title}</h4>
          <p className="text-sm text-gray-300 truncate">
            {product.description}
          </p>
          <div className="flex items-center space-x-3 mt-1">
            <span className="text-xs bg-gray-700 px-2 py-1 rounded">
              ترتیب: {product.order}
            </span>
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 truncate"
            >
              {product.link}
            </a>
          </div>
        </div>
      </div>
      <button
        onClick={() => setConfirmDelete({ type: "product", id: product.id })}
        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        disabled={isDeletingProduct === product.id}
      >
        {isDeletingProduct === product.id ? (
          <span className="loading-dots">حذف</span>
        ) : (
          <FiTrash2 className="w-5 h-5 text-red-500" />
        )}
      </button>
    </div>
  );

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Full size preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 left-4 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDelete && <ConfirmationDialog />}

      <div className="bg-gray-900 text-gray-200 p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-auto relative">
        <div className="flex justify-between items-center mb-6">
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
          <>
            {/* Sliders Section */}
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">اسلایدرها</h3>
                <span className="text-sm text-gray-400">
                  {sliders.length} آیتم
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {sliders.map((slider) => (
                  <SliderItem key={slider.id} slider={slider} />
                ))}
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-3">اسلایدر جدید</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-sm text-gray-300">تصویر</span>
                    <input
                      type="file"
                      onChange={(e) =>
                        setSliderFile(e.target.files?.[0] || null)
                      }
                      className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 file:text-gray-300 file:bg-gray-600 file:border-0 file:mr-2 file:px-3 file:py-1"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm text-gray-300">لینک</span>
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={newSlider.link || ""}
                      onChange={(e) =>
                        setNewSlider({ ...newSlider, link: e.target.value })
                      }
                      className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-sm text-gray-300">
                      متن جایگزین (اختیاری)
                    </span>
                    <input
                      type="text"
                      placeholder="توضیح تصویر"
                      value={newSlider.image_alt || ""}
                      onChange={(e) =>
                        setNewSlider({
                          ...newSlider,
                          image_alt: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                    />
                  </label>
                </div>
                <button
                  onClick={handleAddSlider}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={isUploadingSlider}
                >
                  {isUploadingSlider ? (
                    <span className="loading-dots">در حال آپلود</span>
                  ) : (
                    <>
                      <FiPlus className="w-5 h-5" />
                      افزودن اسلایدر
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* Showcase Products Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">محصولات نمایشی</h3>
                <span className="text-sm text-gray-400">
                  {showcaseProducts.length} آیتم
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {showcaseProducts.map((product) => (
                  <ShowcaseProductItem key={product.id} product={product} />
                ))}
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-3">محصول نمایشی جدید</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-1">
                    <span className="text-sm text-gray-300">تصویر</span>
                    <input
                      type="file"
                      onChange={(e) =>
                        setProductFile(e.target.files?.[0] || null)
                      }
                      className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 file:text-gray-300 file:bg-gray-600 file:border-0 file:mr-2 file:px-3 file:py-1"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm text-gray-300">عنوان</span>
                    <input
                      type="text"
                      placeholder="عنوان محصول"
                      value={newShowcaseProduct.title || ""}
                      onChange={(e) =>
                        setNewShowcaseProduct({
                          ...newShowcaseProduct,
                          title: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm text-gray-300">ترتیب نمایش</span>
                    <input
                      type="number"
                      placeholder="0"
                      value={newShowcaseProduct.order || ""}
                      onChange={(e) =>
                        setNewShowcaseProduct({
                          ...newShowcaseProduct,
                          order: parseInt(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-sm text-gray-300">لینک</span>
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={newShowcaseProduct.link || ""}
                      onChange={(e) =>
                        setNewShowcaseProduct({
                          ...newShowcaseProduct,
                          link: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-sm text-gray-300">توضیحات</span>
                    <textarea
                      placeholder="توضیحات محصول"
                      value={newShowcaseProduct.description || ""}
                      onChange={(e) =>
                        setNewShowcaseProduct({
                          ...newShowcaseProduct,
                          description: e.target.value,
                        })
                      }
                      className="w-full p-2 bg-gray-700 rounded-lg border border-gray-600 resize-none h-24"
                    />
                  </label>
                </div>
                <button
                  onClick={handleAddShowcaseProduct}
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  disabled={isUploadingProduct}
                >
                  {isUploadingProduct ? (
                    <span className="loading-dots">در حال آپلود</span>
                  ) : (
                    <>
                      <FiPlus className="w-5 h-5" />
                      افزودن محصول نمایشی
                    </>
                  )}
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default LandingPageEditor;
