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

    // home-edition routes
    {
      url: `https://farabak.net/products/home-edition`,
    },
    {
      url: `https://farabak.net/products/home-edition/page/2`,
    },
    {
      url: `https://farabak.net/products/home-edition/ptz`,
    },
    {
      url: `https://farabak.net/products/home-edition/dome`,
    },
    {
      url: `https://farabak.net/products/home-edition/bullet`,
    },
    {
      url: `https://farabak.net/products/home-edition/battery`,
    },
    {
      url: `https://farabak.net/products/home-edition/ip`,
    },
    {
      url: `https://farabak.net/products/home-edition/wifi`,
    },
    {
      url: `https://farabak.net/products/home-edition/dual-lens`,
    },
    {
      url: `https://farabak.net/products/home-edition/pan-tilt`,
    },
    {
      url: `https://farabak.net/products/home-edition/4g`,
    },

    // network-cameras routes
    {
      url: `https://farabak.net/products/network-cameras`,
    },
    {
      url: `https://farabak.net/products/network-cameras/explosion-proof`,
    },
    {
      url: `https://farabak.net/products/network-cameras/thermal`,
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
    { url: `https://farabak.net/support/blog` },

    // { url: `https://farabak.net/support/training-section` },
    { url: `https://farabak.net/support/download-center` },
    // { url: `https://farabak.net/support/faq` },
    { url: `https://farabak.net/about-us` },
    { url: `https://farabak.net/about-us/projects` },
    { url: `https://farabak.net/about-us/projects/charmshahr` },

    { url: `https://farabak.net/about-us/members` },

    { url: `https://farabak.net/about-us/activity` },
    { url: `https://farabak.net/contact-us` },
  ];
}
