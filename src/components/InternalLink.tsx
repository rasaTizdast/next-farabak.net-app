import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

interface InternalLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string;
  children: ReactNode;
  /** Opens the link in a new tab with proper security attrs (internal links too) */
  newTab?: boolean;
}

const isExternal = (href: string): boolean =>
  /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href);

/**
 * Smart link component:
 * - internal routes render via next/link (client-side navigation)
 * - external URLs render as plain anchors with rel="noopener noreferrer"
 *   and target="_blank" by default
 */
const InternalLink = ({ href, children, newTab, ...rest }: InternalLinkProps) => {
  const external = isExternal(href);
  const openInNewTab = external || newTab;

  if (openInNewTab) {
    return (
      <a
        href={href}
        {...(external ? { rel: "noopener noreferrer" } : {})}
        target="_blank"
        {...rest}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
};

export default InternalLink;
