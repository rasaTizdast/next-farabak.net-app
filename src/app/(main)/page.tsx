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
  return (
    <div>
      <Slider />
      <ProductsShowCase />
      <ProjectsSection />
      <SupportSection />
    </div>
  );
};

export default HomePage;
