import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import FilterModal from "../FilterModal";

vi.mock("axios");
const mockAxiosGet = vi.mocked(axios.get);

vi.mock("@/hooks/useApiFetch", () => ({
  useApiFetch: (url: string) => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
      axios
        .get(url)
        .then((res) => setData(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [url]);

    return { data, loading, error: null, refetch: () => {} };
  },
}));

const mockFilterData = {
  categories: [
    {
      CategoryID: "1",
      Name: "Electronics",
      subCategories: [
        { CategoryContentID: "10", Name: "Phones" },
        { CategoryContentID: "11", Name: "Laptops" },
      ],
    },
    {
      CategoryID: "2",
      Name: "Clothing",
      subCategories: [{ CategoryContentID: "20", Name: "Shirts" }],
    },
  ],
};

describe("FilterModal", () => {
  const mockApplyFilters = vi.fn();
  const mockSetShowFilterModal = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosGet.mockResolvedValue({ data: mockFilterData, status: 200 });
  });

  it("renders loading state initially", () => {
    mockAxiosGet.mockImplementation(() => new Promise(() => {}));
    render(
      <FilterModal
        filters={{ category: "", subCategory: "", available: null }}
        applyFilters={mockApplyFilters}
        setShowFilterModal={mockSetShowFilterModal}
      />
    );

    expect(screen.getByRole("status")).toBeDefined();
  });

  it("renders filter form after loading", async () => {
    render(
      <FilterModal
        filters={{ category: "", subCategory: "", available: null }}
        applyFilters={mockApplyFilters}
        setShowFilterModal={mockSetShowFilterModal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("اعمال فیلترها")).toBeDefined();
    });

    expect(screen.getByLabelText("دسته‌بندی")).toBeDefined();
    expect(screen.getByLabelText("زیر دسته‌بندی")).toBeDefined();
    expect(screen.getByLabelText("وضعیت موجودی")).toBeDefined();
  });

  it("renders category options from API data", async () => {
    render(
      <FilterModal
        filters={{ category: "", subCategory: "", available: null }}
        applyFilters={mockApplyFilters}
        setShowFilterModal={mockSetShowFilterModal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeDefined();
    });

    expect(screen.getByText("Clothing")).toBeDefined();
  });

  it("calls applyFilters with current filters when apply button is clicked", async () => {
    render(
      <FilterModal
        filters={{ category: "", subCategory: "", available: null }}
        applyFilters={mockApplyFilters}
        setShowFilterModal={mockSetShowFilterModal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("اعمال")).toBeDefined();
    });

    fireEvent.click(screen.getByText("اعمال"));
    expect(mockApplyFilters).toHaveBeenCalledWith({
      category: "",
      subCategory: "",
      available: null,
    });
    expect(mockSetShowFilterModal).toHaveBeenCalledWith(false);
  });

  it("calls setShowFilterModal(false) when close button is clicked", async () => {
    render(
      <FilterModal
        filters={{ category: "", subCategory: "", available: null }}
        applyFilters={mockApplyFilters}
        setShowFilterModal={mockSetShowFilterModal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("✕")).toBeDefined();
    });

    fireEvent.click(screen.getByText("✕"));
    expect(mockSetShowFilterModal).toHaveBeenCalledWith(false);
  });

  it("resets filters when reset button is clicked", async () => {
    render(
      <FilterModal
        filters={{ category: "1", subCategory: "10", available: true }}
        applyFilters={mockApplyFilters}
        setShowFilterModal={mockSetShowFilterModal}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("تنظیم مجدد")).toBeDefined();
    });

    fireEvent.click(screen.getByText("تنظیم مجدد"));
    fireEvent.click(screen.getByText("اعمال"));

    expect(mockApplyFilters).toHaveBeenCalledWith({
      category: "",
      subCategory: "",
      available: null,
    });
  });
});
