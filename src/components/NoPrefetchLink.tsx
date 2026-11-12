import NextLink from "next/link";
import type { ComponentProps } from "react";

type NoPrefetchLinkProps = Omit<ComponentProps<typeof NextLink>, "prefetch">;

/**
 * Public navigation is intentionally fetched on click. The site has a large
 * route graph, so viewport prefetching can turn one page view into dozens of
 * concurrent server renders on memory-constrained deployments.
 */
export default function NoPrefetchLink(props: NoPrefetchLinkProps) {
  return <NextLink {...props} prefetch={false} />;
}
