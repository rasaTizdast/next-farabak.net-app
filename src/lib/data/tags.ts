export const TAGS = {
  categories: "categories",
  products: "products",
  productOverview: "productOverview",
  productSpecs: "productSpecs",
  faqs: "faqs",
  blogs: "blogs",
  members: "members",
  projects: "projects",
  activities: "activities",
  breadcrumbs: "breadcrumbs",
  contactUs: "contactUs",
  sitemap: "sitemap",
  exchangeRate: "exchange-rate",
} as const;

export type Tag = (typeof TAGS)[keyof typeof TAGS];
