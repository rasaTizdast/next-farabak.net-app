const SkeletonTable = () => {
  return (
    <>
      <h3 className="mb-5 font-bold">فاکتورها ثبت شده توسط شما</h3>
      <div className="w-full rounded-md border border-gray-200 shadow-sm">
        <table className="w-full table-auto border-collapse animate-pulse bg-gray-100">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-3 text-center">شماره فاکتور</th>
              <th className="px-4 py-3 text-center">تعداد محصولات</th>
              <th className="px-4 py-3 text-center">وضعیت</th>
              <th className="px-4 py-3 text-center">زمان باقیمانده</th>
              <th className="px-4 py-3 text-center">عملیات‌ها</th>
            </tr>
          </thead>
          <tbody>
            {Array(8)
              .fill("")
              .map((_, idx) => (
                <tr key={idx} className="border-t border-gray-300">
                  <td className="px-4 py-5">
                    <div className="h-4 rounded-md bg-gray-300"></div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="h-4 rounded-md bg-gray-300"></div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="h-4 rounded-md bg-gray-300"></div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="h-4 rounded-md bg-gray-300"></div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="h-4 rounded-md bg-gray-300"></div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SkeletonTable;
