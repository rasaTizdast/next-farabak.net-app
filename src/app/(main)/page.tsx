export const dynamic = "force-dynamic";

import ProductsShowCase from "../_components/LandingPage/ProductsShowCase";
import ProjectsSection from "../_components/LandingPage/ProjectsSection";
import SupportSection from "../_components/LandingPage/SupportSection";
import ImageSlider from "../_components/imageSlider/ImageSlider";

const HomePage = () => {
  const sliderLinks = [
    {
      id: 1,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-home-edition-1.webp`,
      link: "/products/home-edition",
      alt: "محصولات هوم ادیشن موجود در وبسایت فرابک",
    },
    {
      id: 2,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-dome-cameras.webp`,
      link: "/products/home-edition/dome",
      alt: "دورین‌های دام هوم ادیشن موجود در وبسایت فرابک",
    },
    {
      id: 3,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-ip-cameras.webp`,
      link: "/products/home-edition/ip",
      alt: "دورین‌های تحت شبکه هوم ادیشن موجود در وبسایت فرابک",
    },
    {
      id: 4,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-battery-cameras.webp`,
      link: "/products/home-edition/battery",
      alt: "دورین‌های باطری‌دار هوم ادیشن موجود در وبسایت فرابک",
    },
    {
      id: 5,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-home-edition-2.webp`,
      link: "/products/home-edition",
      alt: "مشاهده محصولات هوم ادیشن موجود در وبسایت فرابک",
    },
  ];

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
