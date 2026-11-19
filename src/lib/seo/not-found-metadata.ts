import type { Metadata } from "next";

export const notFoundSeoMetadata: Pick<Metadata, "alternates" | "robots"> = {
  alternates: {
    canonical: null,
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};
