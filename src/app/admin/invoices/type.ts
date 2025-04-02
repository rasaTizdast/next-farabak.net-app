export interface WarrantyCode {
  code: string;
  startdate: string;
  expirydate: string;
  status: string;
}

export interface Warranty {
  id?: string;
  warrantyid?: string;
  warrantycode?: string; // For backward compatibility
  warrantycodes?: WarrantyCode[]; // New field for multiple warranty codes
  status: string;  // 'Active' or 'Expired'
  displayStatus?: string; // Computed status based on date check
  startdate?: string;
  expirydate?: string;
  startDate?: string;
  endDate?: string;
  invoicedetailid?: string;
  branchid?: string;
  ProductId?: string;
}

export interface InvoiceDetail {
  Invoice_Details: string;
  ProductId: string;
  quantity: number;
  price: number;
  total_price: number;
  warranty?: Warranty | null;
  product?: any;
  Name?: string; // Product name from join
  Type?: string; // Product type field
}

export interface AdminInvoice {
  Invoiceid: string;
  FactorGuid: string;
  Fullname: string;
  Phonenumber: string;
  UserId: string;
  Date: string;
  Checked: boolean;
  TotalAmount?: number;
  branchId?: string;
  Invoice_Details?: InvoiceDetail[];
}
