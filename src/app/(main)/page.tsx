import { Metadata } from "next";

import ProductsShowCase from "../_components/LandingPage/ProductsShowCase";
import ProjectsSection from "../_components/LandingPage/ProjectsSection";
import SupportSection from "../_components/LandingPage/SupportSection";
import ImageSlider from "../_components/imageSlider/ImageSlider";

export const metadata: Metadata = {
  title: "پیشرو در تکنولوژی | فرابک",
  description: "پیشرو در تکنولوژی و نوآوری های فرابک با محصولات و خدمات متنوع.",
};

const HomePage = () => {
  const sliderLinks = [
    {
      id: 1,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-home-edition-1.webp`,
      link: "/products/category/home-edition",
      alt: "",
    },
    {
      id: 2,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-dome-cameras.webp`,
      link: "/products/category/home-edition/dome",
      alt: "",
    },
    {
      id: 3,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-ip-cameras.webp`,
      link: "/products/category/home-edition/ip",
      alt: "",
    },
    {
      id: 4,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-battery-cameras.webp`,
      link: "/products/category/home-edition/battery",
      alt: "",
    },
    {
      id: 5,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-home-edition-2.webp`,
      link: "/products/category/home-edition",
      alt: "",
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
