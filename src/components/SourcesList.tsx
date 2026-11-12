import { BookOpen, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import type { SourceLink } from "@/helpers/sources";
import { cn } from "@/lib/utils";

const FARABAK_BASE_URL = "https://farabak.net";

type SourcesListProps = {
  sources?: SourceLink[];
  title?: string;
  className?: string;
  children?: ReactNode;
};

const SourcesList = ({
  sources,
  title = "منابع و مراجع",
  className,
  children,
}: SourcesListProps) => {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={title}
      className={cn(
        "mx-auto w-full max-w-[calc(1900px-20rem)] rounded-lg bg-white p-6 text-sm text-gray-700 shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-[576px]:px-4",
        className
      )}
    >
      <h2 className="mb-8 text-center text-[1.3rem] font-extrabold max-[576px]:mb-4">{title}</h2>
      {children ? (
        <p className="mx-auto mb-6 max-w-3xl text-justify text-[0.95rem] leading-7 text-gray-500">
          {children}
        </p>
      ) : null}
      <ul className="mx-auto max-w-3xl divide-y divide-gray-100 rounded-lg border border-gray-100">
        {sources.map((source) => {
          const isExternal = !source.url.startsWith(FARABAK_BASE_URL);
          const anchorProps = isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {};

          return (
            <li
              key={source.url}
              className="flex items-start gap-3 bg-white px-4 py-3 transition-colors hover:bg-gray-50 max-[576px]:px-3"
            >
              <span
                className={cn(
                  "mt-1 shrink-0 rounded-md p-1.5",
                  isExternal ? "bg-blue-50 text-[#1e90ff]" : "bg-gray-100 text-gray-500"
                )}
              >
                {isExternal ? (
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                ) : (
                  <BookOpen className="size-3.5" aria-hidden="true" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <a
                  href={source.url}
                  className="font-medium text-[#1e90ff] hover:underline"
                  {...anchorProps}
                >
                  {source.label}
                </a>
                {source.description ? (
                  <span className="mt-0.5 block text-xs leading-5 text-gray-500">
                    {source.description}
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default SourcesList;
