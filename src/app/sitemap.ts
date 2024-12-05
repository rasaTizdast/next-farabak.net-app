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
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/home-edition/page/2`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/home-edition/ptz`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/home-edition/dome`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/home-edition/bullet`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/home-edition/battery`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/home-edition/ip`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/home-edition/wifi`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/home-edition/dual-lens`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/home-edition/pan-tilt`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/home-edition/4g`,
      changeFrequency: "weekly",
    },

    // network-cameras routes
    {
      url: `https://farabak.net/products/network-cameras`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/network-cameras/explosion-proof`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/network-cameras/thermal`,
      changeFrequency: "weekly",
    },

    // Blackmagic routes
    {
      url: `https://farabak.net/products/blackmagic`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/blackmagic/page/2`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/blackmagic/camera`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/blackmagic/recording-devices`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/blackmagic/duplicators`,
      changeFrequency: "weekly",
    },

    // x-ray routes
    { url: `https://farabak.net/products/x-ray`, changeFrequency: "weekly" },
    {
      url: `https://farabak.net/products/x-ray/airport-luggage`,
      changeFrequency: "weekly",
    },

    // others routes
    { url: `https://farabak.net/products/others`, changeFrequency: "weekly" },
    {
      url: `https://farabak.net/products/others/nvr`,
      changeFrequency: "weekly",
    },
    {
      url: `https://farabak.net/products/others/accessories`,
      changeFrequency: "weekly",
    },

    ...productEntries,
    { url: `https://farabak.net/support`, changeFrequency: "weekly" },
    { url: `https://farabak.net/support/blog`, changeFrequency: "weekly" },

    // { url: `https://farabak.net/support/training-section` },
    { url: `https://farabak.net/support/download-center` },
    // { url: `https://farabak.net/support/faq` },
    { url: `https://farabak.net/about-us`, changeFrequency: "weekly" },
    { url: `https://farabak.net/about-us/projects`, changeFrequency: "weekly" },
    { url: `https://farabak.net/about-us/projects/charmshahr` },

    { url: `https://farabak.net/about-us/members`, changeFrequency: "weekly" },

    { url: `https://farabak.net/about-us/activity`, changeFrequency: "weekly" },
    { url: `https://farabak.net/contact-us`, changeFrequency: "weekly" },
  ];
}
