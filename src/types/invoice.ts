export interface InvoiceItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Invoice {
  id: string;
  branchId: string;
  items: InvoiceItem[];
  total: number;
  createdAt: string;
}

export interface CreateInvoiceRequest {
  branchId: string;
  items: InvoiceItem[];
}
