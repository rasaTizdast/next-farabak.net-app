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

const Slider = () => {
  return (
    <div className={styles.slider_container}>
      <Swiper
        className={styles.swiper_container}
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay, Virtual]}
        virtual={{ cache: true, enabled: true }}
        // autoplay={{ delay: 4500 }}
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
        {sliderLinks.map((slider) => (
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
