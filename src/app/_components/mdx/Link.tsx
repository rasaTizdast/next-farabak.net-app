import Link from "next/link";

interface LinkProps {
  href: string;
  target?: "blank" | null;
  title?: "";
  children: React.ReactNode;
}

export const CustomLink: React.FC<LinkProps> = ({ href, children, title }) => (
  <Link
    target="_blank"
    href={href}
    title={title}
    className="relative inline-block my-3 px-2 rounded-lg text-blue-950 hover:text-[#000000] bg-blue-200 hover:bg-blue-300 transition-all"
  >
    {children}
  </Link>
);
