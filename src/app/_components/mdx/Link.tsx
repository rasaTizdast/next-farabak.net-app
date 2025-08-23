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
    className="relative my-3 inline-block rounded-lg bg-blue-200 px-2 text-blue-950 transition-all hover:bg-blue-300 hover:text-[#000000]"
  >
    {children}
  </Link>
);
