import Link from "next/link";
import { IoIosArrowBack } from "react-icons/io";
import { Suspense } from "react";

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
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch breadcrumb names");
  }

  return response.json();
}

const BreadcrumbContent: React.FC<{ breadcrumbs: BreadcrumbItem[] }> = async ({
  breadcrumbs,
}) => {
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

const Breadcrumb: React.FC<BreadcrumbProps> = ({ breadcrumbs }) => {
  return (
    <Suspense
      fallback={
        <nav className="w-full flex items-center text-sm mb-5 p-4 bg-gradient-to-l from-[#003262] via-[#0e6aff] to-[#1e90ff] text-white rounded-lg shadow-lg animate-pulse">
          <div className="animate-pulse">در حال ساخت لینک‌ها</div>
        </nav>
      }
    >
      <BreadcrumbContent breadcrumbs={breadcrumbs} />
    </Suspense>
  );
};

export default Breadcrumb;
