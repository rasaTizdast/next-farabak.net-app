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
  productBlog: string;
};

export type Overview = {
  ProductOverviewId: number;
  ProductName: string;
  ProductId: number;
  Property1: string;
  Property2: string;
  Property3: string;
  Property4: string;
  isChanged: true;
};

export type OverviewDetail = {
  ProductOverviewDetailsId: number;
  Title: string;
  Description: string;
  Img: string;
  ProductName: string;
  selected: boolean;
};

export type Specs = {
  data: {
    ProductSpecsId: number;
    Name: string;
    Title: string;
    Description: string;
    ProductId: number;
    Available: boolean;
  }[];
};
