import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";

type BreadcrumbItem = string;

interface BreadcrumbProps {
  breadcrumbs: BreadcrumbItem[];
}

async function fetchBreadcrumbNames(paths: string[]): Promise<Record<string, string>> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/breadcrumbs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paths }),
    // Force server-side fetch in App Router
    next: { revalidate: 0 }, // Prevent caching for dynamic data
  });

  if (!response.ok) {
    throw new Error("Failed to fetch breadcrumb names");
  }

  return response.json();
}

const Breadcrumb: React.FC<BreadcrumbProps> = async ({ breadcrumbs }) => {
  const names = await fetchBreadcrumbNames(breadcrumbs);

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav className="scrollbar-hide mb-5 w-full overflow-x-auto rounded-lg bg-gradient-to-l from-[#003262] via-[#0e6aff] to-[#1e90ff] p-4 text-sm text-white shadow-lg [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center space-x-2">
          {breadcrumbs.map((crumb, idx) => (
            <div key={idx} className="flex items-center whitespace-nowrap">
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
