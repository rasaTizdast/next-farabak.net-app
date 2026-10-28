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
    return <p className="text-sm text-(--farabak-ink-muted)">ویژگی برای این محصول یافت نشد</p>;
  }

  const properties = [
    features.Property1,
    features.Property2,
    features.Property3,
    features.Property4,
  ].filter((prop) => prop !== null && prop !== undefined && prop.trim() !== "");

  if (properties.length === 0) {
    return <p className="text-sm text-(--farabak-ink-muted)">ویژگی برای این محصول یافت نشد</p>;
  }

  return (
    <ul className="my-4 me-5 list-[circle] space-y-2 self-stretch text-sm leading-7 text-(--farabak-ink-muted) sm:text-base">
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
