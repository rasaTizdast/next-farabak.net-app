import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import BranchPartnerPricesPage from "./page";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));

vi.mock("@/helpers/Usd2RialRate", () => ({ fetchUsdToRialRate: vi.fn().mockResolvedValue(50000) }));

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

describe("branch partner prices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.get).mockImplementation(async (url) =>
      url === "/api/exchangeRate" ? { data: { rate: 50000 } } : { data: products }
    );
  });

  it("offers an accessible retry after products fail to load", async () => {
    vi.mocked(axios.get).mockImplementation(async (url) => {
      if (url === "/api/exchangeRate") return { data: { rate: 50000 } };
      if (
        vi.mocked(axios.get).mock.calls.filter(([calledUrl]) => calledUrl !== "/api/exchangeRate")
          .length === 1
      ) {
        throw new Error("Network unavailable");
      }
      return { data: products };
    });

    render(<BranchPartnerPricesPage />);

    const retry = await screen.findByRole("button", { name: "تلاش مجدد" });
    fireEvent.click(retry);

    expect(await screen.findByText("QA router")).toBeTruthy();
    expect(
      vi.mocked(axios.get).mock.calls.filter(([url]) => url === "/api/admin/products?limit=500")
    ).toHaveLength(2);
  }, 15_000);

  it("uses keyboard-operable sort buttons and labels displayed money in toman", async () => {
    render(<BranchPartnerPricesPage />);

    await screen.findByText("QA router");

    expect(screen.getByRole("button", { name: /نام محصول/ })).toBeTruthy();
    expect(screen.getByRole("columnheader", { name: /قیمت \(تومان\)/ })).toBeTruthy();
    expect(screen.getByText("۵٬۰۰۰٬۰۰۰ تومان")).toBeTruthy();
  });

  it("returns to the first page when a search narrows results", async () => {
    const rows = Array.from({ length: 21 }, (_, index) => ({
      ...products.data[0],
      ProductId: index + 1,
      Type: `QA router ${index + 1}`,
    }));
    vi.mocked(axios.get).mockImplementation(async (url) =>
      url === "/api/exchangeRate" ? { data: { rate: 50000 } } : { data: { data: rows } }
    );
    render(<BranchPartnerPricesPage />);
    await screen.findByText("QA router 1");
    fireEvent.click(screen.getByRole("button", { name: "بعدی" }));
    expect(screen.getByText("صفحه 2 از 2")).toBeTruthy();

    fireEvent.change(screen.getByRole("searchbox", { name: "جستجوی محصول" }), {
      target: { value: "QA router 21" },
    });

    await waitFor(() => expect(screen.getByText("صفحه 1 از 1")).toBeTruthy());
    expect(screen.getByText("QA router 21")).toBeTruthy();
  });
});
