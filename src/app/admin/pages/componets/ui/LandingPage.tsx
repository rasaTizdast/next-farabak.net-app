import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Image from "next/image";

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
      toast.error("خطا در دریافت محصولات نمایشی.");
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

  // Skeleton Loading Component
  const SkeletonLoader = () => (
    <div className="animate-pulse space-y-4">
      {/* Slider Skeleton */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
        <div className="h-10 w-20 bg-gray-700 rounded-lg"></div>
      </div>
      {/* Showcase Product Skeleton */}
      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          </div>
        </div>
        <div className="h-10 w-20 bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm shadow-lg">
      <div
        className="bg-gray-900 text-gray-200 p-6 rounded-lg shadow-lg w-full max-w-7xl max-h-[95dvh] overflow-auto"
        dir="rtl"
      >
        <h2 className="text-xl font-bold mb-4">ویرایش صفحه اصلی</h2>

        {/* Loading State */}
        {isLoading && <SkeletonLoader />}

        {/* Sliders Section */}
        {!isLoading && (
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-4">اسلایدرها</h3>
            <div className="space-y-4">
              {sliders.map((slider) => (
                <div
                  key={slider.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <Image
                      width={1920}
                      height={1080}
                      quality={100}
                      src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${slider.image_URL}`}
                      alt={slider.image_alt || "اسلایدر"}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <p className="text-sm text-gray-300">{slider.link}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSlider(slider.id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                    disabled={isDeletingSlider === slider.id}
                  >
                    {isDeletingSlider === slider.id ? "در حال حذف..." : "حذف"}
                  </button>
                </div>
              ))}
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  onChange={(e) => setSliderFile(e.target.files?.[0] || null)}
                  className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <input
                  type="text"
                  placeholder="متن جایگزین (اختیاری)"
                  value={newSlider.image_alt || ""}
                  onChange={(e) =>
                    setNewSlider({ ...newSlider, image_alt: e.target.value })
                  }
                  className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <input
                  type="text"
                  placeholder="لینک"
                  value={newSlider.link || ""}
                  onChange={(e) =>
                    setNewSlider({ ...newSlider, link: e.target.value })
                  }
                  className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  onClick={handleAddSlider}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                  disabled={isUploadingSlider}
                >
                  {isUploadingSlider ? "در حال آپلود..." : "افزودن اسلایدر"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Showcase Products Section */}
        {!isLoading && (
          <section>
            <h3 className="text-lg font-semibold mb-4">محصولات نمایشی</h3>
            <div className="space-y-4">
              {showcaseProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={`${process.env.NEXT_PUBLIC_LIARA_BUCKET_URL}/${product.image}`}
                      alt={product.title}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-medium">{product.title}</h4>
                      <p className="text-sm text-gray-300">
                        {product.description}
                      </p>
                      <p className="text-sm text-gray-300">{product.link}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteShowcaseProduct(product.id)}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                    disabled={isDeletingProduct === product.id}
                  >
                    {isDeletingProduct === product.id ? "در حال حذف..." : "حذف"}
                  </button>
                </div>
              ))}
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  onChange={(e) => setProductFile(e.target.files?.[0] || null)}
                  className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <input
                  type="text"
                  placeholder="عنوان"
                  value={newShowcaseProduct.title || ""}
                  onChange={(e) =>
                    setNewShowcaseProduct({
                      ...newShowcaseProduct,
                      title: e.target.value,
                    })
                  }
                  className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <input
                  type="text"
                  placeholder="توضیحات"
                  value={newShowcaseProduct.description || ""}
                  onChange={(e) =>
                    setNewShowcaseProduct({
                      ...newShowcaseProduct,
                      description: e.target.value,
                    })
                  }
                  className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <input
                  type="number"
                  placeholder="ترتیب"
                  value={newShowcaseProduct.order || ""}
                  onChange={(e) =>
                    setNewShowcaseProduct({
                      ...newShowcaseProduct,
                      order: parseInt(e.target.value),
                    })
                  }
                  className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <input
                  type="text"
                  placeholder="لینک"
                  value={newShowcaseProduct.link || ""}
                  onChange={(e) =>
                    setNewShowcaseProduct({
                      ...newShowcaseProduct,
                      link: e.target.value,
                    })
                  }
                  className="p-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  onClick={handleAddShowcaseProduct}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                  disabled={isUploadingProduct}
                >
                  {isUploadingProduct
                    ? "در حال آپلود..."
                    : "افزودن محصول نمایشی"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
        >
          بستن
        </button>
      </div>
    </div>
  );
};

export default LandingPageEditor;
