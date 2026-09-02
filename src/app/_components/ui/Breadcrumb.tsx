import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";

import { getBreadcrumbNames } from "@/lib/data/breadcrumbs";

type BreadcrumbItem = string;

interface BreadcrumbProps {
  breadcrumbs: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = async ({ breadcrumbs }) => {
  // getBreadcrumbNames throws on DB error — keep the prior throw-on-error behavior.
  const names = await getBreadcrumbNames(breadcrumbs);

  // Prepare structured data for Schema.org
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@id": `${process.env.NEXT_PUBLIC_BASE_URL}${crumb}`,
        name: names[crumb],
        url: `${process.env.NEXT_PUBLIC_BASE_URL}${crumb}`,
      },
    })),
  };

  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <nav className="scrollbar-hide mb-5 w-full scrollbar-none overflow-x-auto rounded-lg bg-linear-to-l from-[#003262] via-[#0e6aff] to-[#1e90ff] p-4 text-sm text-white shadow-lg [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center space-x-2">
          {breadcrumbs.map((crumb, idx) => (
            <div key={crumb} className="flex items-center whitespace-nowrap">
              {idx > 0 && (
                <span className="mx-2 sm:mx-3" aria-hidden="true">
                  <IoIosArrowBack />
                </span>
              )}
              <Link
                href={crumb}
                className="text-white underline-offset-[6px] hover:underline"
                aria-label={`Navigate to ${names[crumb]}`}
              >
                {names[crumb] || "نامشخص"}
              </Link>
            </div>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Breadcrumb;
