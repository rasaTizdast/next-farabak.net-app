import Link from "next/link";

interface LinkProps {
  href: string;
  target?: "blank" | null;
  children: React.ReactNode;
}

export const CustomLink: React.FC<LinkProps> = ({ href, children }) => (
  <Link
    target="_blank"
    href={href}
    className="relative inline-block my-3 px-2 rounded-lg text-blue-950 hover:text-[#000000] bg-blue-200 hover:bg-blue-300 transition-all"
  >
    {children}
  </Link>
);
