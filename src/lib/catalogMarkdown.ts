import { SITE_URL } from "@/constants/meta";
import {
  type ProductDetailPageCheck,
  type ProductListingPageCheck,
  resolveProductDetailPage,
} from "@/lib/data/product-page-validation";
import {
  type CategoryProductsResult,
  getAllProducts,
  getCategoryName,
  getProductBySlug,
  getProductsByCategory,
  getProductsBySubcategory,
  getSubCategoryName,
} from "@/lib/data/products";
import { getProductSpecsByProductId } from "@/lib/data/productSpecs";
import type { MarkdownPage } from "@/lib/markdownContent";
import { prisma } from "@/lib/prisma";
import { getProductBrand } from "@/lib/seo/product-brand";

const PRODUCTS_PER_PAGE = 30;

type CatalogListing = Pick<CategoryProductsResult, "data" | "pagination"> &
  Partial<Pick<CategoryProductsResult, "seoDetails">>;

function markdownText(value: string | null | undefined): string {
  return (
    value
      ?.replace(/\s+/g, " ")
      .trim()
      .replace(/[\\`*_\[\]<>#]/g, "\\$&") ?? ""
  );
}

function catalogPath(...segments: string[]): string {
  return ["/products", ...segments.map(encodeURIComponent)].join("/");
}

function listingSlicePath(path: string, page: number): string {
  return page === 1 ? path : `${path}/page/${page}`;
}

async function getProductListingMarkdown(
  check: ProductListingPageCheck
): Promise<MarkdownPage | null> {
  const pagination = { page: check.page, limit: PRODUCTS_PER_PAGE };
  const result: CatalogListing | null =
    check.type === "all"
      ? await getAllProducts(pagination)
      : check.type === "category"
        ? await getProductsByCategory(check.category, pagination)
        : await getProductsBySubcategory(check.subcategory, pagination, check.category);
  if (!result) return null;

  let name = "تمامی محصولات";
  let basePath = "/products";
  let parentPath = "/products";
  if (check.type === "category") {
    const category = await getCategoryName(check.category);
    name = category?.categoryName || check.category;
    basePath = catalogPath(check.category);
  } else if (check.type === "subcategory") {
    const subcategory = await getSubCategoryName(check.subcategory);
    name = subcategory?.subCategoryName || check.subcategory;
    basePath = catalogPath(check.category, check.subcategory);
    parentPath = catalogPath(check.category);
  }

  const path = listingSlicePath(basePath, check.page);
  const title = check.page === 1 ? name : `${name} – صفحه ${check.page}`;
  const candidateIds = [...new Set(result.data.map((item) => item.ProductId))];
  const eligibleRows = candidateIds.length
    ? await prisma.product.findMany({
        where: {
          ProductId: { in: candidateIds },
          Available: true,
          OR: [{ QrCode_Key: null }, { QrCode_Key: "" }],
        },
        select: { ProductId: true },
      })
    : [];
  const eligibleIds = new Set(eligibleRows.map((row) => row.ProductId));
  const productLinks = result.data.flatMap((item) => {
    if (
      !eligibleIds.has(item.ProductId) ||
      !item.Available ||
      item.QrCode_Key ||
      !item.productSlug ||
      !item.categorySlug ||
      !item.subCategorySlug
    ) {
      return [];
    }

    const href = catalogPath(item.categorySlug, item.subCategorySlug, item.productSlug);
    const model = markdownText(item.Type || item.Name || item.productSlug);
    const brand = getProductBrand(item.categorySlug, item.Type);
    return [`- [${model}](${href})${brand ? ` — ${brand}` : ""}`];
  });
  const description = markdownText(result.seoDetails?.SEO_Description);
  const relatedLinks = [
    ...(check.type !== "all" ? [`- [دسته‌بندی بالاتر](${parentPath})`] : []),
    ...(result.pagination.hasPrevPage
      ? [`- [صفحه قبل](${listingSlicePath(basePath, check.page - 1)})`]
      : []),
    ...(result.pagination.hasNextPage
      ? [`- [صفحه بعد](${listingSlicePath(basePath, check.page + 1)})`]
      : []),
  ];

  return {
    path,
    title,
    markdown:
      [
        `# ${markdownText(title)}`,
        description,
        productLinks.length ? productLinks.join("\n") : "در این صفحه محصول عمومی فهرست نشده است.",
        relatedLinks.join("\n"),
      ]
        .filter(Boolean)
        .join("\n\n") + "\n",
  };
}

async function getProductDetailMarkdown(
  check: ProductDetailPageCheck
): Promise<MarkdownPage | null> {
  const resolution = await resolveProductDetailPage({ ...check, key: null });
  if (!resolution) return null;

  const product = await getProductBySlug(check.product);
  if (
    !product?.Available ||
    product.QrCode_key ||
    !product.productSlug ||
    !product.categorySlug ||
    !product.subCategorySlug
  ) {
    return null;
  }

  const path = catalogPath(product.categorySlug, product.subCategorySlug, product.productSlug);
  if (path !== resolution.canonicalPath) return null;

  const { data: specs } = await getProductSpecsByProductId(product.ProductId);
  const title = product.Type?.trim() || product.Name?.trim() || product.productSlug;
  const name = markdownText(product.Name);
  const description = markdownText(product.Description || product.SEO_Description);
  const brand = getProductBrand(product.categorySlug, product.Type);
  const specLines = specs.flatMap((spec) => {
    const label = markdownText(spec.Title || spec.Name);
    const value = markdownText(spec.Description);
    return label && value ? [`- ${label}: ${value}`] : [];
  });

  return {
    path,
    title,
    markdown:
      [
        `# ${markdownText(title)}`,
        name !== markdownText(title) && name,
        brand && `برند: **${markdownText(brand)}**`,
        description !== name && description,
        specLines.length && ["## مشخصات فنی", ...specLines].join("\n"),
        [
          `- [صفحه محصول](${new URL(path, SITE_URL)})`,
          `- [دسته‌بندی محصول](${catalogPath(product.categorySlug, product.subCategorySlug)})`,
          "- [تمامی محصولات](/products)",
          "- [تماس با فرابک](/contact-us)",
        ].join("\n"),
      ]
        .filter(Boolean)
        .join("\n\n") + "\n",
  };
}

export function getCatalogMarkdown(
  check: ProductListingPageCheck | ProductDetailPageCheck
): Promise<MarkdownPage | null> {
  return check.type === "product"
    ? getProductDetailMarkdown(check)
    : getProductListingMarkdown(check);
}
