import Image from "next/image";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2, FiZoomIn } from "react-icons/fi";

export type ShowcaseProduct = {
  id: number;
  title: string;
  description: string;
  order: number;
  image: string;
  link: string;
  productProductId?: number;
};

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
          type="button"
          onClick={() => onMoveUp(product.id, product.order)}
          disabled={isFirst}
          aria-label="انتقال به بالا"
          className={`mb-1 rounded-md p-1 ${
            isFirst ? "text-gray-500" : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <FiArrowUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => onMoveDown(product.id, product.order)}
          disabled={isLast}
          aria-label="انتقال به پایین"
          className={`rounded-md p-1 ${
            isLast ? "text-gray-500" : "text-gray-400 hover:bg-gray-700 hover:text-white"
          }`}
        >
          <FiArrowDown className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onDelete(product.id)}
        className="rounded-lg p-2 transition-colors hover:bg-gray-700"
        disabled={isDeleting}
        aria-label="حذف محصول نمایشی"
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
          aria-label="انتخاب تصویر محصول نمایشی"
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
          aria-label="عنوان محصول نمایشی"
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
            aria-label="ترتیب نمایش محصول"
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
          aria-label="لینک محصول نمایشی"
          className="w-full rounded-lg border border-gray-600 bg-gray-700 p-2"
        />
      </label>
      <label className="space-y-1 md:col-span-2">
        <span className="text-sm text-gray-300">توضیحات</span>
        <textarea
          placeholder="توضیحات محصول"
          value={newProduct.description || ""}
          onChange={(e) => onFieldChange("description", e.target.value)}
          aria-label="توضیحات محصول نمایشی"
          className="h-24 w-full resize-none rounded-lg border border-gray-600 bg-gray-700 p-2"
        />
      </label>
    </div>
    <button
      type="button"
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

export const ShowcaseProductSection = ({
  products,
  onPreview,
  onConfirmDelete,
  isDeletingProduct,
  newShowcaseProduct,
  setNewShowcaseProduct,
  productFile,
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
  const sortedProducts = products.toSorted((a, b) => a.order - b.order);
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