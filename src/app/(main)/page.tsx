export const dynamic = "force-dynamic";

import ImageSlider from "../_components/imageSlider/ImageSlider";
import ProductsShowCase from "../_components/LandingPage/ProductsShowCase";
import ProjectsSection from "../_components/LandingPage/ProjectsSection";
import SupportSection from "../_components/LandingPage/SupportSection";

type slider = {
  id: number;
  image_URL: string;
  link: string;
  image_alt: string | null;
};

const HomePage = async () => {
  let sliderLinks = [];

  try {
    const response = await fetch(`${process.env.BASE_URL}/api/landingPage/sliders`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) throw new Error("Failed to fetch sliders");

    const sliders = await response.json();

    sliderLinks = sliders.map((slider: slider) => ({
      id: slider.id,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/${slider.image_URL}`,
      link: slider.link,
      alt: slider.image_alt || "فرابک محصولات امنیتی و نظارت تصویری",
    }));
  } catch (error) {
    console.error("Slider fetch error:", error);
  }

  return (
    <div>
      <ImageSlider slides={sliderLinks} />
      <ProductsShowCase />
      <ProjectsSection />
      <SupportSection />
    </div>
  );
};

export default HomePage;
