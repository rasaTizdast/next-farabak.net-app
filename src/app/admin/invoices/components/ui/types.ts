import { InvoiceDetail, Warranty } from "../../type";

export interface ExpandedInvoiceItem extends InvoiceDetail {
  itemNumber?: number;
  itemIndex?: number;
  individualWarranty?: Warranty | null;
  Name?: string;
}
