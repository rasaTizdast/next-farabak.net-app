import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import ChangeStatusModal from "./ChangeStatusModal";
import DeleteInvoiceModal from "./DeleteInvoiceModal";
import { AdminInvoice } from "../../type";

const invoice: AdminInvoice = {
  Invoiceid: "99",
  FactorGuid: "QA-INVOICE",
  Fullname: "QA Customer",
  Phonenumber: "09120000000",
  UserId: "1",
  Date: "1405-01-01",
  Checked: false,
};

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

describe("invoice mutation dialogs", () => {
  it("keeps a failed status update open so the selection can be retried", async () => {
    const onClose = vi.fn();
    const onStatusChange = vi.fn().mockResolvedValue(false);
    render(
      <ChangeStatusModal invoice={invoice} onClose={onClose} onStatusChange={onStatusChange} />
    );
    fireEvent.click(screen.getByRole("button", { name: "ذخیره" }));
    await waitFor(() => expect(onStatusChange).toHaveBeenCalledWith("99", false));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps deletion pending, blocks repeated actions and closes only on success", async () => {
    let resolve!: (value: boolean) => void;
    const onDelete = vi.fn(
      () =>
        new Promise<boolean>((done) => {
          resolve = done;
        })
    );
    const onClose = vi.fn();
    render(<DeleteInvoiceModal invoice={invoice} onClose={onClose} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("checkbox"));
    const remove = screen.getByRole("button", { name: "Delete invoice" });
    fireEvent.click(remove);
    expect(remove).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.click(remove);
    expect(onDelete).toHaveBeenCalledTimes(1);
    await act(async () => resolve(true));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps a failed delete open for retry", async () => {
    const onClose = vi.fn();
    const onDelete = vi.fn().mockResolvedValue(false);
    render(<DeleteInvoiceModal invoice={invoice} onClose={onClose} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Delete invoice" }));
    await waitFor(() => expect(onDelete).toHaveBeenCalled());
    expect(onClose).not.toHaveBeenCalled();
  });
});
