import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, renderHook, act, waitFor } from "@testing-library/react";
import React from "react";

import { InvoiceProvider, useInvoice } from "../InvoiceContext";

const mockSaveInvoice = vi.fn();
const mockGetInvoice = vi.fn();
const mockClearInvoice = vi.fn();

vi.mock("@/hooks/useInvoiceCookie", () => ({
  useInvoiceCookie: () => ({
    saveInvoiceToCookie: mockSaveInvoice,
    getInvoiceFromCookie: mockGetInvoice,
    clearInvoiceCookie: mockClearInvoice,
    isLoading: false,
  }),
}));

function TestConsumer() {
  const invoice = useInvoice();
  return (
    <div>
      <div data-testid="total-amount">{invoice.invoice.TotalAmount}</div>
      <div data-testid="product-count">{invoice.invoice.products.length}</div>
      <button
        data-testid="add-product"
        onClick={() => invoice.addProductToInvoice(1, 2, "Test Product", 100)}
      >
        Add
      </button>
      <button data-testid="remove-product" onClick={() => invoice.removeProductFromInvoice(1)}>
        Remove
      </button>
      <button data-testid="clear-invoice" onClick={() => invoice.clearInvoice()}>
        Clear
      </button>
    </div>
  );
}

describe("InvoiceContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetInvoice.mockResolvedValue(null);
  });

  it("throws useInvoice without provider", () => {
    expect(() => {
      renderHook(() => useInvoice());
    }).toThrow("useInvoice must be used within an InvoiceProvider");
  });

  it("starts with empty invoice", () => {
    render(
      <InvoiceProvider>
        <TestConsumer />
      </InvoiceProvider>
    );
    expect(screen.getByTestId("total-amount").textContent).toBe("0");
    expect(screen.getByTestId("product-count").textContent).toBe("0");
  });

  it("adds a product to invoice", async () => {
    render(
      <InvoiceProvider>
        <TestConsumer />
      </InvoiceProvider>
    );

    await act(async () => {
      screen.getByTestId("add-product").click();
    });

    expect(screen.getByTestId("product-count").textContent).toBe("1");
  });

  it("removes a product from invoice", async () => {
    render(
      <InvoiceProvider>
        <TestConsumer />
      </InvoiceProvider>
    );

    await act(async () => {
      screen.getByTestId("add-product").click();
    });

    expect(screen.getByTestId("product-count").textContent).toBe("1");

    await act(async () => {
      screen.getByTestId("remove-product").click();
    });

    expect(screen.getByTestId("product-count").textContent).toBe("0");
  });
});
