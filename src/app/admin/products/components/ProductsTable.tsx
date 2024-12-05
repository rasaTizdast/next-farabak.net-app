import Link from "next/link";
import ProductTableSkeleton from "./ProductTableSkeleton";
import { FaExternalLinkAlt } from "react-icons/fa";
import { formatPrice } from "../helper/formatPrice";

type Product = {
  ProductId: number;
  Type: string;
  categorySlug: string;
  subCategorySlug: string;
  productSlug: string;
  Price: number;
  Available: boolean;
  link: string;
};

type Props = {
  isLoading: boolean;
  filteredProducts: Product[];
  setIsModalOpen: (arg0: boolean) => void;
  setCurrentAction: (updatedAction: {
    id: number;
    type: string;
    name: string;
  }) => void;
};

const ProductsTable = ({
  isLoading,
  filteredProducts,
  setIsModalOpen,
  setCurrentAction,
}: Props) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl max-w-[1800px]">
      <table className="w-full text-sm text-center text-gray-300 table-auto border-spacing-0 border-separate">
        <thead className="text-sm text-gray-100 uppercase bg-slate-800">
          <tr>
            <th scope="col" className="px-6 py-3">
              نام محصول
            </th>
            <th scope="col" className="px-6 py-3">
              دسته‌بندی
            </th>
            <th scope="col" className="px-6 py-3">
              زیر دسته‌بندی
            </th>
            <th scope="col" className="px-6 py-3">
              شناسه محصول
            </th>
            <th scope="col" className="px-6 py-3">
              قیمت
            </th>
            <th scope="col" className="px-6 py-3">
              موجودی
            </th>
            <th scope="col" className="px-6 py-3 text-center">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading
            ? [...Array(10)].map((_, index: number) => (
                <ProductTableSkeleton key={index} />
              ))
            : filteredProducts.map((product, index) => (
                <tr
                  key={product.ProductId}
                  className={`${
                    index % 2 === 0 ? "bg-slate-700" : "bg-slate-600"
                  } hover:bg-slate-900 transition-all`}
                >
                  <td className="px-6 py-4">{product.Type}</td>
                  <td className="px-6 py-4">{product.categorySlug}</td>
                  <td className="px-6 py-4">{product.subCategorySlug}</td>
                  <td className="px-6 py-4">{product.productSlug}</td>
                  <td className="px-6 py-4">{formatPrice(product.Price)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-lg ${
                        product.Available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.Available ? "موجود" : "ناموجود"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setIsModalOpen(true);
                          setCurrentAction({
                            id: product.ProductId,
                            type: "availability",
                            name: product.Type,
                          });
                        }}
                        className="px-2 py-1 bg-amber-600 text-white text-xs sm:text-sm rounded-lg hover:bg-amber-800 transition-all"
                      >
                        {product.Available ? "غیرفعال‌سازی" : "فعال‌سازی"}
                      </button>
                      <button
                        onClick={() => {
                          setIsModalOpen(true);
                          setCurrentAction({
                            id: product.ProductId,
                            type: "delete",
                            name: product.Type,
                          });
                        }}
                        className="px-2 py-1 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-all"
                      >
                        حذف
                      </button>
                      <Link
                        href={`/products/${product.link}`}
                        target="_blank"
                        className="flex gap-2 items-center px-2 py-1 bg-emerald-600 text-white text-xs sm:text-sm rounded-lg hover:bg-emerald-700 transition-all"
                      >
                        صفحه محصول‌
                        <FaExternalLinkAlt />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
