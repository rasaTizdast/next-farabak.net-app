import axios from "axios";
import { useEffect, useRef, useState } from "react";

type AdminInvoice = {
  InvoiceId: string;
  FactorGuid: string;
  Fullname: string;
  Phonenumber: string;
  TotalAmount: number;
  Date: string;
  Checked: boolean;
  Invoice_Details: {
    ProductId: string;
    quantity: number;
    price: number;
    total_price: number;
  }[];
};

type Props = {
  invoice: AdminInvoice | null;
  onClose: () => void;
};

const AdminInvoiceDetailsModal = ({ invoice, onClose }: Props) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [productNames, setProductNames] = useState<{ [key: string]: string }>(
    {}
  );

  if (!invoice) return null;

  // Helper function to format the date and time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} | ${hours}:${minutes}:${seconds}`;
  };

  // Fetch product names
  useEffect(() => {
    const fetchProductNames = async () => {
      try {
        // Map over Invoice_Details and make async calls for each product
        const productNameRequests = invoice.Invoice_Details.map(
          async (product) => {
            const res = await axios.get(
              `/api/products/getProductType/${product.ProductId}`
            );
            return { id: product.ProductId, name: res.data.productType };
          }
        );

        // Wait for all promises to resolve
        const results = await Promise.all(productNameRequests);

        // Update state with the resolved product names
        const names = results.reduce((acc, curr) => {
          acc[curr.id] = curr.name;
          return acc;
        }, {} as { [key: string]: string });

        setProductNames(names);
      } catch (error) {
        console.error("Error fetching product names:", error);
      }
    };

    fetchProductNames();
  }, [invoice]); // Add invoice as a dependency so it triggers when it changes

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div ref={componentRef} className="p-3 sm:p-6">
          <div className="text-gray-100">
            {/* Header */}
            <div className="mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-center">
                جزئیات فاکتور {invoice.FactorGuid}#
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6" dir="rtl">
              {/* Customer Details */}
              <div className="space-y-3 sm:space-y-4 bg-slate-800 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">نام و نام خانوادگی:</span>
                  <span className="font-medium">{invoice.Fullname}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">شماره کاربر:</span>
                  <span className="font-medium">{invoice.Phonenumber}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-300">تاریخ ثبت فاکتور:</span>
                  <span className="font-medium" dir="ltr">
                    {formatDateTime(invoice.Date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">وضعیت فاکتور:</span>
                  <span className="font-medium">
                    {invoice.Checked ? (
                      <span className="text-green-400">بررسی شده</span>
                    ) : (
                      <span className="text-yellow-400">در انتظار بررسی</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto bg-slate-800 rounded-lg">
                <table className="w-full text-xs sm:text-sm whitespace-nowrap">
                  <thead className="bg-slate-700">
                    <tr>
                      <th className="p-2 sm:p-4 text-right font-medium text-gray-300">
                        شناسه محصول
                      </th>
                      <th className="p-2 sm:p-4 text-right font-medium text-gray-300">
                        تعداد
                      </th>
                      <th className="p-2 sm:p-4 text-right font-medium text-gray-300">
                        قیمت واحد - تومان
                      </th>
                      <th className="p-2 sm:p-4 text-right font-medium text-gray-300">
                        قیمت کل - تومان
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {invoice.Invoice_Details.map((product) => (
                      <tr
                        key={product.ProductId}
                        className="hover:bg-slate-750"
                      >
                        <td className="p-2 sm:p-4">
                          {productNames[product.ProductId] ||
                            "در حال بارگذاری..."}
                        </td>
                        <td className="p-2 sm:p-4">{product.quantity}</td>
                        <td className="p-2 sm:p-4">
                          {product.price.toLocaleString("fa")}
                        </td>
                        <td className="p-2 sm:p-4">
                          {product.total_price.toLocaleString("fa")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center text-base sm:text-lg font-bold p-3 sm:p-4 bg-slate-800 rounded-lg">
                <span className="text-gray-300">مجموع کل:</span>
                <span className="text-green-400 flex gap-1 items-center">
                  <span>
                    {invoice.Invoice_Details.reduce(
                      (sum, product) => sum + product.total_price,
                      0
                    ).toLocaleString("fa")}
                  </span>
                  <span>تومان</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 p-3 sm:p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 text-gray-100 text-sm sm:text-base"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminInvoiceDetailsModal;
