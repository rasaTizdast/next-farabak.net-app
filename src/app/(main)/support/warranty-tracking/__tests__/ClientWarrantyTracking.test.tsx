import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("lucide-react", () => {
  const IconStub = (props: Record<string, unknown>) =>
    React.createElement("svg", { "data-testid": "lucide-stub", ...props });
  return {
    ArrowLeft: IconStub,
    ArrowRight: IconStub,
    Calendar: IconStub,
    CheckCircle2: IconStub,
    Clock: IconStub,
    Info: IconStub,
    Loader2: IconStub,
    Phone: IconStub,
    Tag: IconStub,
    XCircle: IconStub,
  };
});

import WarrantyTrackingPage from "../ClientWarrantyTracking";

const okJson = (data: unknown) => ({ ok: true, json: async () => data });
const errorJson = (error: string) => ({ ok: false, json: async () => ({ error }) });

const activeWarranty = {
  status: "active",
  message: "گارانتی فعال است",
  data: {
    startDate: "2025-01-01",
    expiryDate: "2027-01-01",
    status: "Active",
    customerPhone: "09120000000",
  },
};

const confirmSuccess = {
  status: "success",
  message: "درخواست بررسی گارانتی با موفقیت ثبت شد",
  data: {
    startDate: "2025-01-01",
    expiryDate: "2027-01-01",
    status: "Requested",
    customerPhone: "09120000000",
  },
};

describe("ClientWarrantyTracking", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the initial warranty search form", () => {
    render(<WarrantyTrackingPage />);
    expect(screen.getByPlaceholderText("کد گارانتی را وارد کنید")).toBeInTheDocument();
    expect(screen.getByText("بررسی")).toBeInTheDocument();
  });

  it("advances to the result step after search then confirm without extra requests", async () => {
    fetchMock
      .mockResolvedValueOnce(okJson(activeWarranty))
      .mockResolvedValueOnce(okJson(confirmSuccess));

    render(<WarrantyTrackingPage />);

    fireEvent.change(screen.getByPlaceholderText("کد گارانتی را وارد کنید"), {
      target: { value: "W-001" },
    });
    fireEvent.click(screen.getByText("بررسی"));

    const confirmButton = await screen.findByText("تایید و ثبت درخواست");
    expect(confirmButton).toBeInTheDocument();

    fireEvent.click(confirmButton);

    expect(await screen.findByText("درخواست بررسی گارانتی با موفقیت ثبت شد")).toBeInTheDocument();

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const searchBody = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(searchBody).toEqual({ warrantycode: "W-001", checkOnly: true });

    const confirmBody = JSON.parse(String(fetchMock.mock.calls[1][1].body));
    expect(confirmBody).toEqual({ warrantycode: "W-001", confirm: true });
  });

  it("shows the error box and stays on step 0 when the search fails", async () => {
    fetchMock.mockResolvedValueOnce(errorJson("کد گارانتی وارد شده معتبر نیست"));

    render(<WarrantyTrackingPage />);

    fireEvent.change(screen.getByPlaceholderText("کد گارانتی را وارد کنید"), {
      target: { value: "BAD-CODE" },
    });
    fireEvent.click(screen.getByText("بررسی"));

    await waitFor(() => {
      expect(screen.getAllByText("خطا در بررسی گارانتی").length).toBeGreaterThan(0);
    });

    expect(screen.getByPlaceholderText("کد گارانتی را وارد کنید")).toBeInTheDocument();
    expect(screen.queryByText("تایید و ثبت درخواست")).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("stays on the confirm step when the confirm request fails", async () => {
    fetchMock
      .mockResolvedValueOnce(okJson(activeWarranty))
      .mockResolvedValueOnce(errorJson("خطا در ثبت درخواست گارانتی"));

    render(<WarrantyTrackingPage />);

    fireEvent.change(screen.getByPlaceholderText("کد گارانتی را وارد کنید"), {
      target: { value: "W-001" },
    });
    fireEvent.click(screen.getByText("بررسی"));

    const confirmButton = await screen.findByText("تایید و ثبت درخواست");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    expect(screen.getByText("تایید و ثبت درخواست")).toBeInTheDocument();
    expect(screen.queryByText("درخواست بررسی گارانتی با موفقیت ثبت شد")).toBeNull();
  });
});
