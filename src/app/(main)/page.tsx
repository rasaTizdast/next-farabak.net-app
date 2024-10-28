import { Metadata } from "next";

import Slider from "../_components/slider/Slider";
import ProductsShowCase from "../../components/LandingPage/ProductsShowCase";
import ProjectsSection from "../../components/LandingPage/ProjectsSection";
import SupportSection from "../../components/LandingPage/SupportSection";

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
