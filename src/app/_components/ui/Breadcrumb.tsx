import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";

type BreadcrumbItem = string;

interface BreadcrumbProps {
  breadcrumbs: BreadcrumbItem[];
}

async function fetchBreadcrumbNames(
  paths: string[]
): Promise<Record<string, string>> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/breadcrumbs`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paths }),
      // Force server-side fetch in App Router
      cache: "no-store", // Use "force-cache" or "no-store" based on your needs
      next: { revalidate: 0 }, // Prevent caching for dynamic data
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch breadcrumb names");
  }

  return response.json();
}

const Breadcrumb: React.FC<BreadcrumbProps> = async ({ breadcrumbs }) => {
  const names = await fetchBreadcrumbNames(breadcrumbs);

  return (
    <nav className="w-full flex items-center text-sm mb-5 p-4 bg-gradient-to-l from-[#003262] via-[#0e6aff] to-[#1e90ff] text-white rounded-lg shadow-lg">
      <div className="flex flex-wrap items-center space-x-2">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center">
            {idx > 0 && (
              <span className="mx-2">
                <IoIosArrowBack />
              </span>
            )}
            <Link
              href={crumb}
              className="text-white hover:underline underline-offset-[6px]"
            >
              {names[crumb] || "نامشخص"}
            </Link>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default Breadcrumb;
