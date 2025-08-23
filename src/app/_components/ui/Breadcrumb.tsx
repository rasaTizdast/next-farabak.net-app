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

  return (
    <nav className="mb-5 flex w-full items-center rounded-lg bg-gradient-to-l from-[#003262] via-[#0e6aff] to-[#1e90ff] p-4 text-sm text-white shadow-lg">
      <div className="flex flex-wrap items-center space-x-2">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center">
            {idx > 0 && (
              <span className="mx-2">
                <IoIosArrowBack />
              </span>
            )}
            <Link href={crumb} className="text-white underline-offset-[6px] hover:underline">
              {names[crumb] || "نامشخص"}
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;
