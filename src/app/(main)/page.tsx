import { Metadata } from "next";

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
      alt: "",
    },
    {
      id: 2,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-dome-cameras.webp`,
      link: "/products/home-edition/dome",
      alt: "",
    },
    {
      id: 3,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-ip-cameras.webp`,
      link: "/products/home-edition/ip",
      alt: "",
    },
    {
      id: 4,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-battery-cameras.webp`,
      link: "/products/home-edition/battery",
      alt: "",
    },
    {
      id: 5,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/slider-home-edition-2.webp`,
      link: "/products/home-edition",
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
