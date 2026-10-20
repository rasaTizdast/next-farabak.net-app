import { describe, expect, it } from "vitest";

import { AdminInvoice, Warranty } from "@/app/admin/invoices/type";

import { expandInvoiceItems } from "./useExpandedItems";

const makeInvoice = (quantity: number, warranty: Warranty | null) =>
  ({
    Invoice_Details: [
      {
        Invoice_Details: "1",
        ProductId: "9",
        quantity,
        price: 100,
        total_price: quantity * 100,
        warranty,
      },
    ],
  }) as AdminInvoice;

describe("expandInvoiceItems", () => {
  it("keeps one row per unit when none of the units has a warranty", () => {
    const items = expandInvoiceItems(makeInvoice(3, null), {});

    expect(items).toHaveLength(3);
    expect(items.map((item) => item.itemNumber)).toEqual([1, 2, 3]);
    expect(items.map((item) => item.individualWarranty)).toEqual([null, null, null]);
  });

  it("does not assign the first warranty to units without warranty codes", () => {
    const items = expandInvoiceItems(
      makeInvoice(3, {
        status: "Active",
        warrantycodes: [
          { code: "QA-W1", startdate: "2026-01-01", expirydate: "2027-01-01", status: "Active" },
        ],
      }),
      {}
    );

    expect(items).toHaveLength(3);
    expect(items.map((item) => item.individualWarranty?.warrantycode ?? null)).toEqual([
      "QA-W1",
      null,
      null,
    ]);
  });

  it("keeps legacy single warranty data attached to only one unit", () => {
    const items = expandInvoiceItems(
      makeInvoice(2, {
        status: "Active",
        warrantycode: "QA-LEGACY",
      }),
      {}
    );

    expect(items.map((item) => item.individualWarranty?.warrantycode ?? null)).toEqual([
      "QA-LEGACY",
      null,
    ]);
  });
});
