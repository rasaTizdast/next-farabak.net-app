const SITE_ORIGIN = "https://farabak.net";

export interface CollectionProduct {
  name: string | null | undefined;
  path: string | null | undefined;
}

export interface CollectionBreadcrumb {
  name: string;
  path: string;
}

function absoluteSiteUrl(path: string): string | null {
  try {
    const url = new URL(path, SITE_ORIGIN);
    if (url.origin !== SITE_ORIGIN || url.username || url.password) return null;
    return url.href;
  } catch {
    return null;
  }
}

function canonicalPageUrl(value: string): string | null {
  try {
    const parsed = new URL(value, SITE_ORIGIN);
    return new URL(parsed.pathname, SITE_ORIGIN).href;
  } catch {
    return null;
  }
}

export function buildProductCollectionSchema({
  title,
  canonicalUrl,
  breadcrumbs,
  products,
}: {
  title: string;
  canonicalUrl: string;
  breadcrumbs: CollectionBreadcrumb[];
  products: CollectionProduct[];
}) {
  const pageUrl = canonicalPageUrl(canonicalUrl);
  const itemListElement: Array<{
    "@type": string;
    position: number;
    name: string;
    url: string;
  }> = [];
  products.forEach((product) => {
    const name = product.name?.trim();
    const path = product.path?.trim();
    const pathSegments = path?.split("/").filter(Boolean) ?? [];
    const productUrl =
      pathSegments.length === 3 && pathSegments.every((segment) => !segment.includes(":"))
        ? absoluteSiteUrl(`/products/${pathSegments.join("/")}`)
        : null;

    if (!name || !productUrl) {
      return;
    }

    itemListElement.push({
      "@type": "ListItem",
      position: itemListElement.length + 1,
      name,
      url: productUrl,
    });
  });

  if (!pageUrl) return null;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": pageUrl,
    url: pageUrl,
    name: title,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbs.flatMap((breadcrumb, index) => {
        const item = absoluteSiteUrl(breadcrumb.path);
        return item
          ? [
              {
                "@type": "ListItem",
                position: index + 1,
                name: breadcrumb.name,
                item,
              },
            ]
          : [];
      }),
    },
    mainEntity: {
      "@type": "ItemList",
      "@id": `${pageUrl}#itemlist`,
      numberOfItems: itemListElement.length,
      itemListElement,
    },
    inLanguage: "fa-IR",
  };
}
