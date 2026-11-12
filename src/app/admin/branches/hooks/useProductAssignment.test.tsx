import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useProductAssignment } from "./useProductAssignment";

const { form } = vi.hoisted(() => ({ form: { resetFields: vi.fn() } }));
vi.mock("antd", () => ({
  Form: { useForm: () => [form] },
  message: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({ mutate: vi.fn() }),
}));

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("branch product assignment loading", () => {
  it("keeps the initial-load callback stable after loading products", async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ data: [{ ProductId: 2 }] }));
    vi.stubGlobal("fetch", fetch);
    const { result } = renderHook(() =>
      useProductAssignment({
        currentBranch: null,
        onBranchChange: vi.fn(),
        onRefreshBranches: vi.fn(),
      })
    );
    const initialFetch = result.current.fetchAllProducts;
    await act(async () => result.current.fetchAllProducts());
    expect(result.current.allProducts).toEqual([{ ProductId: 2 }]);
    expect(result.current.fetchAllProducts).toBe(initialFetch);
  });
});
