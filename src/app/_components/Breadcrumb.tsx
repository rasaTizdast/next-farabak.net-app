// src/app/(main)/products/_components/Breadcrumb.tsx

import Link from "next/link";
import { getRouteName } from "@/utils/routeNames";
import { IoIosArrowBack } from "react-icons/io";

interface BreadcrumbItem {
  path: string;
  href: string;
}

interface BreadcrumbProps {
  breadcrumbs: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ breadcrumbs }) => {
  return (
    <nav className="flex items-center text-sm mb-5 p-4 bg-gradient-to-l from-[#003262] via-[#0e6aff] to-[#1e90ff]  text-white rounded-lg shadow-lg">
      <div className="flex flex-wrap items-center space-x-2">
        {breadcrumbs.map((crumb, idx) => {
          const name = getRouteName(crumb.path);

          return (
            <div key={idx} className="flex items-center">
              {idx > 0 && (
                <span className="mx-2">
                  <IoIosArrowBack />
                </span>
              )}
              <Link href={crumb.href} className="text-white">
                {name}
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumb;
