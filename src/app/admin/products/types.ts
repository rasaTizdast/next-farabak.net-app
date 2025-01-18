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
  img1: File | null;
  img2: File | null;
  CategoryContentId: string;
  CategoryContentIds: {
    CategoryContentId: number;
    Name: string;
  }[];
  QrCode_Key: string | null;
  QrCode_expiryDays: string | null;
};
