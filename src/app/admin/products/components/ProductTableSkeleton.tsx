// Skeleton Row Component
const ProductTableSkeleton = () => {
  return (
    <tr className="animate-pulse bg-slate-800">
      {[...Array(8)].map((_, index) => (
        <td key={index} className="p-6">
          <div className="h-4 w-full rounded bg-slate-700"></div>
        </td>
      ))}
    </tr>
  );
};

export default ProductTableSkeleton;
