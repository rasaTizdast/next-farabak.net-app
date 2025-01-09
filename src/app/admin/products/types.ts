export type Product = {
  ProductId: number;
  Name: string;
  Type: string;
  categoryName: string;
  CategoryId: number;
  subCategoryName: string;
  productSlug: string;
  Price: string;
  Discount: string;
  Available: boolean;
  Description: string;
  SEO_Title: string;
  SEO_Description: string;
  link: string;
  img1: string;
  img2: string;
  CategoryContentId: string;
  CategoryContentIds: {
    CategoryContentId: number;
    Name: string;
  }[];
};
