import { Metadata } from "next";

import Slider from "../_components/slider/Slider";
import ProductsShowCase from "../_components/LandingPage/ProductsShowCase";
import ProjectsSection from "../_components/LandingPage/ProjectsSection";
import SupportSection from "../_components/LandingPage/SupportSection";

export const metadata: Metadata = {
  title: "پیشرو در تکنولوژی | فرابک",
  description: "پیشرو در تکنولوژی و نوآوری های فرابک با محصولات و خدمات متنوع.",
};

const HomePage = () => {
  const sliderLinks = [
    {
      id: 1,
      img: "/slider-imgs/1.webp",
      link: "/products/category/home-edition",
      alt: "",
    },
    {
      id: 2,
      img: "/slider-imgs/2.webp",
      link: "/products/category/home-edition?q=dome",
      alt: "",
    },
    {
      id: 3,
      img: "/slider-imgs/3.webp",
      link: "/products/category/home-edition?q=ip",
      alt: "",
    },
    {
      id: 4,
      img: "/slider-imgs/4.webp",
      link: "/products/category/home-edition?q=battery",
      alt: "",
    },
    {
      id: 5,
      img: "/slider-imgs/5.webp",
      link: "/products/category/home-edition",
      alt: "",
    },
  ];

  return (
    <div>
      <Slider slides={sliderLinks} />
      <ProductsShowCase />
      <ProjectsSection />
      <SupportSection />
    </div>
  );
};

export default HomePage;
