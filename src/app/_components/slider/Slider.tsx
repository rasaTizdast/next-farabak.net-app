"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
  Virtual,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import styles from "./Slider.module.css";
import Link from "next/link"; // Use Next.js Link for routing
import Image from "next/image"; // Import Image from Next.js

type Slides = {
  slides: {
    id: number;
    img: string;
    link: string;
    alt: string;
  }[];
};

const Slider = ({ slides }: Slides) => {
  return (
    <div className={styles.slider_container}>
      <Swiper
        className={styles.swiper_container}
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay, Virtual]}
        virtual={{ cache: true, enabled: true }}
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
        {slides.map((slider) => (
          <SwiperSlide key={slider.id} className={styles.swiper_slide}>
            <Link href={slider.link}>
              <Image
                src={slider.img}
                alt={slider.alt}
                loading="eager"
                height={900}
                width={1920}
                quality={100}
                priority={true}
                unoptimized
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
