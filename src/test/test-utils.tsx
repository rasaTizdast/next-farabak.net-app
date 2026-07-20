import { render, type RenderOptions } from "@testing-library/react";
import React from "react";
import { UserProvider } from "@/context/UserContext";

function AllProviders({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
