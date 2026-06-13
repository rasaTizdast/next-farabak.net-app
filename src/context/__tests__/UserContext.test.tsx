import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import React from "react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const mockAxiosGet = vi.fn();
const mockAxiosPost = vi.fn();

const MockAxiosError = vi.hoisted(() => {
  return class extends Error {
    isAxiosError = true;
    response?: { status: number };
    constructor(msg: string, status?: number) {
      super(msg);
      if (status) this.response = { status };
    }
  };
});

vi.mock("axios", () => ({
  default: {
    get: (...args: any[]) => mockAxiosGet(...args),
    post: (...args: any[]) => mockAxiosPost(...args),
    isAxiosError: (err: any) => err?.isAxiosError === true,
  },
  AxiosError: MockAxiosError,
}));

import { UserProvider, useUser } from "../UserContext";

function TestConsumer() {
  const userCtx = useUser();
  return (
    <div>
      <div data-testid="loading">{userCtx.loading.toString()}</div>
      <div data-testid="isLoggedIn">{userCtx.isLoggedIn.toString()}</div>
      <div data-testid="user-fullname">{userCtx.userFullName}</div>
    </div>
  );
}

describe("UserContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts loading and fetches profile on mount", async () => {
    mockAxiosGet.mockResolvedValue({
      data: {
        userId: "123",
        username: "admin",
        role: "admin",
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        phoneNumber: "09120000000",
      },
    });

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("isLoggedIn").textContent).toBe("true");
    expect(screen.getByTestId("user-fullname").textContent).toBe("John Doe");
  });

  it("handles 401 error gracefully", async () => {
    const axiosError = new MockAxiosError("Unauthorized", 401);
    mockAxiosGet.mockRejectedValue(axiosError);

    render(
      <UserProvider>
        <TestConsumer />
      </UserProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("isLoggedIn").textContent).toBe("false");
  });
});
