import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { loadInitialBranchData, useBranchData } from "./useBranchData";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock("@/hooks/useApiMutation", () => ({ useApiMutation: () => ({ mutate }) }));
vi.mock("antd", () => ({
  message: { success: vi.fn(), error: vi.fn() },
  Form: { useForm: () => [{ resetFields: vi.fn() }] },
  InputNumber: "input",
}));

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("branch dashboard recovery", () => {
  it("clears an earlier authentication error when retry succeeds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ branchid: 7 })));
    const setError = vi.fn();
    const setAuthError = vi.fn();
    await loadInitialBranchData(
      vi.fn(),
      setError,
      setAuthError,
      vi.fn(),
      vi.fn(),
      vi.fn(),
      vi.fn()
    );
    expect(setError).toHaveBeenCalledWith(null);
    expect(setAuthError).toHaveBeenCalledWith(false);
  });

  it("does not submit a quantity twice when focus leaves after debounce", async () => {
    vi.useFakeTimers();
    mutate.mockResolvedValue({ success: true });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(async () =>
          Response.json({ data: [], pagination: { currentPage: 1, totalCount: 0 } })
        )
    );
    const { result } = renderHook(() => useBranchData());
    act(() =>
      result.current.setBranch({ branchid: 7 } as NonNullable<typeof result.current.branch>)
    );
    act(() => result.current.handleDebouncedQuantityChange(12, 5));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    const input = result.current.productColumns[1].render!(1, {
      ProductId: 12,
      quantity: 1,
    } as never);
    await act(async () => input.props.onBlur());
    expect(mutate).toHaveBeenCalledTimes(1);
  });
});
