// Skeleton Row Component
const ProductTableSkeleton = () => {
  return (
    <tr className="animate-pulse bg-slate-800">
      {[...Array(7)].map((_, index) => (
        <td key={index} className="p-6">
          <div className="h-4 bg-slate-700 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
};

export default ProductTableSkeleton;
