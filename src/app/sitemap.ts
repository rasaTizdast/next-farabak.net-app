export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/sitemap/products`
  );
  const { urls } = await response.json();
  const productEntries: MetadataRoute.Sitemap = urls.map((item: string) => ({
    url: `${item}`,
  }));
  return [
    { url: `https://farabak.net` },

    { url: `https://farabak.net/products` },

    // reolink-cctv-camera routes
    {
      url: `https://farabak.net/products/reolink-cctv-camera`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/page/2`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/ptz`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/dome`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/bullet`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/battery`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/ip`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/wifi`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/dual-lens`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/pan-tilt`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/4g`,
    },
    {
      url: `https://farabak.net/products/reolink-cctv-camera/night-vision`,
    },

    // industrial-cctv-camera routes
    {
      url: `https://farabak.net/products/industrial-cctv-camera`,
    },
    {
      url: `https://farabak.net/products/industrial-cctv-camera/explosion-proof-cctv-camera`,
    },
    {
      url: `https://farabak.net/products/industrial-cctv-camera/thermal-cctv-camera`,
    },

    // Blackmagic routes
    {
      url: `https://farabak.net/products/blackmagic`,
    },
    {
      url: `https://farabak.net/products/blackmagic/page/2`,
    },
    {
      url: `https://farabak.net/products/blackmagic/camera`,
    },
    {
      url: `https://farabak.net/products/blackmagic/recording-devices`,
    },
    {
      url: `https://farabak.net/products/blackmagic/duplicators`,
    },

    // x-ray routes
    { url: `https://farabak.net/products/x-ray` },
    {
      url: `https://farabak.net/products/x-ray/airport-luggage`,
    },

    // others routes
    { url: `https://farabak.net/products/others` },
    {
      url: `https://farabak.net/products/others/nvr`,
    },
    {
      url: `https://farabak.net/products/others/accessories`,
    },

    ...productEntries,

    { url: `https://farabak.net/support` },
    { url: `https://farabak.net/support/download-center` },

    { url: `https://farabak.net/support/blog` },
    { url: `https://farabak.net/support/blog/reolink/` },
    { url: `https://farabak.net/support/blog/reolink/reolink-products` },

    { url: `https://farabak.net/about-us` },
    { url: `https://farabak.net/about-us/projects` },
    { url: `https://farabak.net/about-us/projects/charmshahr` },

    { url: `https://farabak.net/about-us/members` },

    { url: `https://farabak.net/about-us/activity` },
    { url: `https://farabak.net/contact-us` },
  ];
}
