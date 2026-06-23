import CategorySlider from "./CategorySlider";

interface CategorySliderWrapperProps {
  type: "categories" | "subcategories";
  categorySlug?: string;
}

export default async function CategorySliderWrapper({
  type,
  categorySlug,
}: CategorySliderWrapperProps) {
  return <CategorySlider type={type} categorySlug={categorySlug} />;
}
