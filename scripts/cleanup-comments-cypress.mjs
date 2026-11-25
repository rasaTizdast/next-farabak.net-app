import { PrismaClient } from "@prisma/client";

function getFixtureId() {
  const fixtureId = process.env.COMMENTS_E2E_FIXTURE_ID;
  if (!fixtureId || !/^[a-z0-9]{8}$/.test(fixtureId)) {
    throw new Error("Set COMMENTS_E2E_FIXTURE_ID to the 8-character seed fixture ID.");
  }

  return fixtureId;
}

function getDisposableDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error("Set DATABASE_URL to the isolated app test database.");

  const url = new URL(value);
  const database = decodeURIComponent(url.pathname.slice(1));
  const testDatabase = process.env.TEST_DATABASE_URL
    ? new URL(process.env.TEST_DATABASE_URL)
    : null;
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname) ||
    !/^farabak_app_test_[a-z0-9_]+$/.test(database) ||
    url.search ||
    url.hash ||
    (testDatabase && decodeURIComponent(testDatabase.pathname.slice(1)) === database)
  ) {
    throw new Error(
      "Refusing cleanup: DATABASE_URL must be a loopback farabak_app_test_* database."
    );
  }

  return url;
}

const fixtureId = getFixtureId();
const databaseUrl = getDisposableDatabaseUrl();
const prisma = new PrismaClient({ datasourceUrl: databaseUrl.toString() });
const memberUsername = `comments_e2e_member_${fixtureId}`;
const adminUsername = `comments_e2e_admin_${fixtureId}`;
const blogCategorySlug = `codex-comments-e2e-blog-category-${fixtureId}`;
const productCategorySlug = `codex-comments-e2e-category-${fixtureId}`;
const productSubcategorySlug = `codex-comments-e2e-subcategory-${fixtureId}`;
const productSlug = `codex-comments-e2e-product-${fixtureId}`;
const articleSlug = `codex-comments-e2e-article-${fixtureId}`;
const privateArticleSlug = `codex-comments-e2e-private-${fixtureId}`;

try {
  const [users, product, article, privateArticle] = await Promise.all([
    prisma.client.findMany({
      where: { Username: { in: [memberUsername, adminUsername] } },
      select: { UserID: true },
    }),
    prisma.product.findFirst({ where: { Slug: productSlug }, select: { ProductId: true } }),
    prisma.blogs.findFirst({ where: { slug: articleSlug }, select: { id: true } }),
    prisma.blogs.findFirst({ where: { slug: privateArticleSlug }, select: { id: true } }),
  ]);

  const userIds = users.map(({ UserID }) => UserID);
  const blogIds = [article?.id, privateArticle?.id].filter((id) => id !== undefined);

  await prisma.$transaction(async (tx) => {
    await tx.publicComment.deleteMany({
      where: {
        OR: [
          ...(blogIds.length > 0 ? [{ blogId: { in: blogIds } }] : []),
          ...(product ? [{ productId: product.ProductId }] : []),
          ...(userIds.length > 0
            ? [{ actorId: { in: userIds } }, { reviewerId: { in: userIds } }]
            : []),
        ],
      },
    });
    await tx.password.deleteMany({ where: { UserId: { in: userIds } } });
    await tx.client.deleteMany({ where: { UserID: { in: userIds } } });
    await tx.blogs.deleteMany({ where: { id: { in: blogIds } } });
    await tx.categories.deleteMany({ where: { slug: blogCategorySlug } });
    if (product) await tx.product.delete({ where: { ProductId: product.ProductId } });
    await tx.categoryContent.deleteMany({ where: { Slug: productSubcategorySlug } });
    await tx.category.deleteMany({ where: { Slug: productCategorySlug } });
  });

  console.log(
    `Removed disposable comment fixtures ${fixtureId} from ${databaseUrl.pathname.slice(1)}.`
  );
} finally {
  await prisma.$disconnect();
}
