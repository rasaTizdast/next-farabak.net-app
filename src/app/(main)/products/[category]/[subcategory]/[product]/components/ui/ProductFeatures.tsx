// app/products/[category]/[product]/components/ProductFeatures.tsx
import { getProductOverview } from "@/lib/data/productOverview";

async function getProductFeatures(productId: number) {
  try {
    return await getProductOverview(productId);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function ProductFeatures({ productId }: { productId: number }) {
  const features = await getProductFeatures(productId);

  if (!features) {
    return <p>ویژگی برای این محصول یافت نشد</p>;
  }

  const properties = [
    features.Property1,
    features.Property2,
    features.Property3,
    features.Property4,
  ].filter((prop) => prop !== null && prop !== undefined && prop.trim() !== "");

  if (properties.length === 0) {
    return <p>ویژگی برای این محصول یافت نشد</p>;
  }

  return (
    <ul className="my-4 me-8 list-[circle] self-stretch text-[1rem] font-light max-[950px]:w-1/2 max-[640px]:me-6 max-[640px]:gap-x-8 max-[640px]:gap-y-4 max-[640px]:text-[0.9rem] max-[576px]:my-0 max-[576px]:w-full max-[550px]:me-4">
      {properties.map((property) => (
        <li
          key={property}
          className="max-w-full py-1 wrap-break-word [hyphens:auto] max-[950px]:w-fit"
        >
          {property}
        </li>
      ))}
    </ul>
  );
}
