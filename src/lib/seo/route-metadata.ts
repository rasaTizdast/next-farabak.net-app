import type { Metadata } from "next";

import { OG_IMAGE_PATH, SITE_NAME } from "@/constants/meta";

type RouteMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
};

export function createRouteMetadata({
  title,
  description,
  path,
  image = OG_IMAGE_PATH,
  imageAlt = `${SITE_NAME} | ${title}`,
}: RouteMetadataInput): Pick<Metadata, "alternates" | "openGraph" | "twitter"> {
  return {
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      images: [{ url: image, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
