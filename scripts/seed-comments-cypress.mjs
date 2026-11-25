import { randomUUID } from "node:crypto";

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

function getDisposableDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("Set DATABASE_URL to an isolated app test database.");

  const url = new URL(value);
  const database = decodeURIComponent(url.pathname.slice(1));
  const testDatabase = process.env.TEST_DATABASE_URL
    ? new URL(process.env.TEST_DATABASE_URL)
    : null;
  const isLoopback = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);

  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !isLoopback ||
    !/^farabak_app_test_[a-z0-9_]+$/.test(database) ||
    url.search ||
    url.hash ||
    (testDatabase && decodeURIComponent(testDatabase.pathname.slice(1)) === database)
  ) {
    throw new Error(
      "Refusing to seed: DATABASE_URL must be a loopback farabak_app_test_* database, separate from TEST_DATABASE_URL."
    );
  }

  return url;
}

const databaseUrl = getDisposableDatabaseUrl();
const password = process.env.COMMENTS_E2E_PASSWORD;
if (!password || password.length < 12) {
  throw new Error("Set COMMENTS_E2E_PASSWORD to a disposable password of at least 12 characters.");
}

const fixtureId = randomUUID().replaceAll("-", "").slice(0, 8).toLowerCase();
const memberUsername = `comments_e2e_member_${fixtureId}`;
const adminUsername = `comments_e2e_admin_${fixtureId}`;
const blogCategorySlug = `codex-comments-e2e-blog-category-${fixtureId}`;
const articleSlug = `codex-comments-e2e-article-${fixtureId}`;
const privateArticleSlug = `codex-comments-e2e-private-${fixtureId}`;
const productCategorySlug = `codex-comments-e2e-category-${fixtureId}`;
const productSubcategorySlug = `codex-comments-e2e-subcategory-${fixtureId}`;
const productSlug = `codex-comments-e2e-product-${fixtureId}`;
const prisma = new PrismaClient({ datasourceUrl: databaseUrl.toString() });

try {
  const passwordHash = await bcrypt.hash(password, 10);
  const fixture = await prisma.$transaction(async (tx) => {
    const member = await tx.client.create({
      data: {
        Username: memberUsername,
        FirstName: "کاربر",
        LastName: "آزمایشی",
        Role: "Public",
      },
      select: { UserID: true },
    });
    const admin = await tx.client.create({
      data: {
        Username: adminUsername,
        FirstName: "مدیر",
        LastName: "آزمایشی",
        Role: "Admin",
      },
      select: { UserID: true },
    });

    await tx.password.createMany({
      data: [member.UserID, admin.UserID].map((UserId) => ({
        UserId,
        Password1: passwordHash,
        Active: true,
      })),
    });

    const blogCategory = await tx.categories.create({
      data: { name: "مقاله آزمایشی دیدگاه", slug: blogCategorySlug },
      select: { id: true },
    });
    const article = await tx.blogs.create({
      data: {
        title: "مقاله آزمایشی دیدگاه",
        SEO_Title: "مقاله آزمایشی دیدگاه",
        slug: articleSlug,
        status: "Published",
        content: "مقاله محلی برای آزمون دیدگاه‌ها.",
        SEO_description: "داده آزمایشی محلی",
        BlogCategories: { create: { category_id: blogCategory.id } },
      },
      select: { id: true },
    });
    const privateArticle = await tx.blogs.create({
      data: {
        title: "مقاله خصوصی آزمایشی",
        SEO_Title: "مقاله خصوصی آزمایشی",
        slug: privateArticleSlug,
        status: "Published",
        content: "مقاله QR خصوصی برای آزمون دیدگاه‌ها.",
        SEO_description: "داده آزمایشی محلی",
        QrCode_key: "comments-e2e-private-key",
        BlogCategories: { create: { category_id: blogCategory.id } },
      },
      select: { id: true },
    });

    const productCategory = await tx.category.create({
      data: { Name: "دسته آزمایشی دیدگاه", Available: true, Slug: productCategorySlug },
      select: { CategoryID: true },
    });
    const productSubcategory = await tx.categoryContent.create({
      data: {
        Name: "زیرگروه آزمایشی دیدگاه",
        CategoryID: productCategory.CategoryID,
        Available: true,
        Slug: productSubcategorySlug,
      },
      select: { CategoryContentId: true },
    });
    const product = await tx.product.create({
      data: {
        Name: "محصول آزمایشی دیدگاه",
        Type: "محصول آزمایشی",
        Price: "1",
        Discount: "0",
        CategoryContentId: String(productSubcategory.CategoryContentId),
        Available: true,
        Description: "داده آزمایشی محلی",
        CategoryId: productCategory.CategoryID,
        Slug: productSlug,
        QrCode_Key: "",
      },
      select: { ProductId: true },
    });

    return {
      articleId: article.id,
      privateBlogId: privateArticle.id,
      productId: product.ProductId,
    };
  });

  console.log(
    JSON.stringify({
      fixtureId,
      articlePath: `/support/blog/${blogCategorySlug}/${articleSlug}`,
      articleId: fixture.articleId,
      privateBlogId: fixture.privateBlogId,
      productPath: `/products/${productCategorySlug}/${productSubcategorySlug}/${productSlug}`,
      productId: fixture.productId,
      memberUsername,
      adminUsername,
      passwordEnvironmentVariable: "COMMENTS_E2E_PASSWORD",
    })
  );
} finally {
  await prisma.$disconnect();
}
