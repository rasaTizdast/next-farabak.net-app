import { render, type RenderOptions } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";

import { InvoiceProvider } from "@/context/InvoiceContext";
import { UserProvider } from "@/context/UserContext";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => "/"),
  useParams: vi.fn(() => ({})),
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    return <img {...props} alt={props.alt || ""} />;
  },
}));

vi.mock("next/link", () => ({
  default: (
    props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }
  ) => <a {...props}>{props.children}</a>,
}));

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <InvoiceProvider>{children}</InvoiceProvider>
    </UserProvider>
  );
}

export function renderWithAllProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
