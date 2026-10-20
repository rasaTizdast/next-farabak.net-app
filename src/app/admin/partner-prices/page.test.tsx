import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminPartnerPricesPage from "./page";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("antd", () => ({
  message: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock("@/hooks/useApiFetch", () => ({
  useApiFetch: () => ({ data: { rate: 50000 }, loading: false, error: null }),
}));

const products = {
  data: [
    {
      ProductId: 7,
      Type: "QA router",
      Price: 100,
      Discount: 0,
      Partner_Price: "80",
      link: "qa-router",
    },
  ],
};

describe("admin partner prices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.get).mockResolvedValue({ data: products });
    vi.mocked(axios.patch).mockResolvedValue({ status: 200 });
  });

  it("offers a retry when products fail to load", async () => {
    vi.mocked(axios.get)
      .mockRejectedValueOnce(new Error("Network unavailable"))
      .mockResolvedValueOnce({ data: products });

    render(<AdminPartnerPricesPage />);

    expect(await screen.findByRole("button", { name: "تلاش مجدد" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "تلاش مجدد" }));

    expect(await screen.findByText("QA router")).toBeTruthy();
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it("keeps the edited value and lets the user retry after a save error", async () => {
    vi.mocked(axios.patch).mockRejectedValueOnce(new Error("Network unavailable"));
    render(<AdminPartnerPricesPage />);

    const input = await screen.findByRole("textbox", { name: "قیمت همکار برای QA router" });
    fireEvent.change(input, { target: { value: "75" } });
    fireEvent.click(screen.getByRole("button", { name: "ذخیره قیمت برای QA router" }));

    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(1));
    expect(input).toHaveValue("75");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "ذخیره قیمت برای QA router" })).toBeEnabled()
    );

    fireEvent.click(screen.getByRole("button", { name: "ذخیره قیمت برای QA router" }));
    await waitFor(() => expect(axios.patch).toHaveBeenCalledTimes(2));
    expect(axios.patch).toHaveBeenLastCalledWith("/api/admin/products/7", { Partner_Price: "75" });
  });

  it("preserves invalid input for correction and does not save a negative price", async () => {
    render(<AdminPartnerPricesPage />);

    const input = await screen.findByRole("textbox", { name: "قیمت همکار برای QA router" });
    fireEvent.change(input, { target: { value: "-1" } });
    fireEvent.click(screen.getByRole("button", { name: "ذخیره قیمت برای QA router" }));

    expect(input).toHaveValue("-1");
    expect(axios.patch).not.toHaveBeenCalled();
    expect((await import("antd")).message.error).toHaveBeenCalled();
  });

  it("saves the edited value when Enter is pressed", async () => {
    render(<AdminPartnerPricesPage />);

    const input = await screen.findByRole("textbox", { name: "قیمت همکار برای QA router" });
    fireEvent.change(input, { target: { value: "75" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/products/7", { Partner_Price: "75" })
    );
  });

  it("normalizes Persian digits and the Persian decimal separator", async () => {
    render(<AdminPartnerPricesPage />);

    const input = await screen.findByRole("textbox", { name: "قیمت همکار برای QA router" });
    fireEvent.change(input, { target: { value: "۱۲٫۵" } });
    expect(input).toHaveValue("12.5");
    fireEvent.click(screen.getByRole("button", { name: "ذخیره قیمت برای QA router" }));

    await waitFor(() =>
      expect(axios.patch).toHaveBeenCalledWith("/api/admin/products/7", { Partner_Price: "12.5" })
    );
  });

  it("returns to the first page when the search term changes", async () => {
    const data = Array.from({ length: 21 }, (_, index) => ({
      ...products.data[0],
      ProductId: index + 1,
      Type: `QA product ${index + 1}`,
    }));
    vi.mocked(axios.get).mockResolvedValue({ data: { data } });
    render(<AdminPartnerPricesPage />);

    await screen.findByText("QA product 1");
    fireEvent.click(screen.getByRole("button", { name: "بعدی" }));
    expect(screen.getByText("صفحه 2 از 2")).toBeTruthy();

    fireEvent.change(screen.getByRole("searchbox", { name: "جستجوی محصول" }), {
      target: { value: "QA product 21" },
    });

    await waitFor(() => expect(screen.getByText("صفحه 1 از 1")).toBeTruthy());
    expect(screen.getByText("QA product 21")).toBeTruthy();
  });
});
