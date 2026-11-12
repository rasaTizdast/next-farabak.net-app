import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";

export interface HomeSliderLink {
  id: number;
  img: string;
  link: string;
  alt: string;
}

// Homepage hero slider (landing_page.sliders). Previously a local ISR fetch on
// the homepage; hoisted into the cached data layer so it participates in `use cache`.
export async function getSliders(): Promise<HomeSliderLink[]> {
  "use cache";
  cacheTag("sliders");
  cacheLife("hours");

  try {
    const sliders = await prisma.sliders.findMany();

    return sliders.map((slider) => ({
      id: slider.id,
      img: `${process.env.LIARA_BUCKET_URL}/slider-imgs/${slider.image_URL}`,
      link: slider.link,
      alt: slider.image_alt || "فرابک محصولات امنیتی و نظارت تصویری",
    }));
  } catch (error) {
    console.error("Slider fetch error:", error);
    return [];
  }
}
