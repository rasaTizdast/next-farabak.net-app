import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

import { ImagePreview, ConfirmationDialog, SkeletonLoader } from "./LandingPageShared";
import { ShowcaseProductSection, type ShowcaseProduct } from "./LandingPageShowcase";
import { SliderSection, type Slider } from "./LandingPageSliders";

type ActivityEditModalProps = {
  onClose: () => void;
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
  const [isUploadingSlider, setIsUploadingSlider] = useState<boolean>(false);
  const [isUploadingProduct, setIsUploadingProduct] = useState<boolean>(false);
  const [isDeletingSlider, setIsDeletingSlider] = useState<number | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState<number | null>(null);

  const slidersInitializedRef = useRef(false);
  const productsInitializedRef = useRef(false);

  // Fetch sliders and showcase products on component mount
  const { data: slidersData } = useApiFetch<Slider[]>("/api/landingPage/sliders");
  const { data: productsData } = useApiFetch<ShowcaseProduct[]>(
    "/api/landingPage/showcase_products"
  );
  const { mutate: deleteSliderMutate } = useApiMutation("delete");
  const { mutate: deleteProductMutate } = useApiMutation("delete");
  const { mutate: updateOrderMutate } = useApiMutation("patch");

  const isLoading = !slidersData || !productsData;

  useEffect(() => {
    if (slidersData && !slidersInitializedRef.current) {
      slidersInitializedRef.current = true;

      setSliders(slidersData);
    }
  }, [slidersData]);

  useEffect(() => {
    if (productsData && !productsInitializedRef.current) {
      productsInitializedRef.current = true;

      setShowcaseProducts(productsData);
    }
  }, [productsData]);

  const handleAddSlider = async () => {
    if (!sliderFile) {
      toast.error("لطفا یک فایل انتخاب کنید.");
      return;
    }

    setIsUploadingSlider(true);
    try {
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
    } finally {
      setIsUploadingSlider(false);
    }
  };

  const handleAddShowcaseProduct = async () => {
    if (!productFile) {
      toast.error("لطفا یک فایل انتخاب کنید.");
      return;
    }

    setIsUploadingProduct(true);
    try {
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
    } finally {
      setIsUploadingProduct(false);
    }
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
      if (!step1) {
        toast.error("خطا در تغییر ترتیب محصول.");
        return;
      }

      const step2 = await updateProductOrder(prevProduct.id, currentOrder);
      if (!step2) {
        toast.error("خطا در تغییر ترتیب محصول.");
        return;
      }

      const step3 = await updateProductOrder(id, prevProduct.order);
      if (!step3) {
        toast.error("خطا در تغییر ترتیب محصول.");
        return;
      }

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
      if (!step1) {
        toast.error("خطا در تغییر ترتیب محصول.");
        return;
      }

      const step2 = await updateProductOrder(nextProduct.id, currentOrder);
      if (!step2) {
        toast.error("خطا در تغییر ترتیب محصول.");
        return;
      }

      const step3 = await updateProductOrder(id, nextProduct.order);
      if (!step3) {
        toast.error("خطا در تغییر ترتیب محصول.");
        return;
      }

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
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
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

      <div
        className="relative max-h-[95vh] w-full max-w-4xl overflow-auto rounded-lg bg-gray-900 p-6 text-gray-200 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between bg-gray-900 py-2">
          <h2 className="text-2xl font-bold">ویرایش صفحه اصلی</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-gray-800"
            aria-label="بستن"
          >
            <FiX className="size-6 text-red-400 transition-colors hover:text-red-500" />
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
