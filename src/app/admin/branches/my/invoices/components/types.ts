import { InvoiceDetail, Warranty } from "@/app/admin/invoices/type";

export interface ExtendedWarranty extends Warranty {
  hasWarranty?: boolean;
  branchname?: string;
  branchid?: string;
}

export interface ExpandedInvoiceItem extends InvoiceDetail {
  itemNumber?: number;
  itemIndex?: number;
  individualWarranty?: ExtendedWarranty | null;
  Name?: string;
}
