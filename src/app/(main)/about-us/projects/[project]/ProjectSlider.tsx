"use client"

import { Swiper, SwiperSlide } from "swiper/react";
import {
  A11y,
  Autoplay,
  Navigation,
  Pagination,
  Scrollbar,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import styles from "./ProjectPage.module.css";
import Image from "next/image";

type Props = {
  slides: string[];
};

const ProjectSlider = ({ slides }: Props) => {
  return (
    <Swiper
      className={styles.slider}
      modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
      autoplay={{ delay: 4500 }}
      a11y={{
        prevSlideMessage: "Previous slide",
        nextSlideMessage: "Next slide",
      }}
      navigation
      loop={true}
      centeredSlides={true}
      slidesPerView={1}
      pagination={{ clickable: true }}
    >
      {slides.map((item, index) => (
        <SwiperSlide key={index} className={styles.slide}>
          <Image
            src={item}
            alt={`Project slide ${index + 1}`}
            width={1920}
            height={1080}
            quality={100}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ProjectSlider;
