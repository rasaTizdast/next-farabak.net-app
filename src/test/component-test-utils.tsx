import React from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { UserProvider } from "@/context/UserContext";
import { InvoiceProvider } from "@/context/InvoiceContext";

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
  default: (props: any) => {
    const { priority, ...rest } = props;
    return <img {...rest} alt={rest.alt || ""} />;
  },
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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
