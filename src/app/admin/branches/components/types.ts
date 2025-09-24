export interface Branch {
  branchid: number;
  name: string;
  location: string;
  productCount: number;
  totalQuantity: number;
  specificProductQuantity?: number;
  createdat: string;
  UserID: number;
}

export interface User {
  UserID: number;
  Username: string;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
}

export interface Product {
  ProductId: number;
  Name?: string;
  Type: string;
  Price?: string;
  Discount?: string;
  quantity: number;
}

export interface Invoice {
  Invoiceid: number;
  FactorGuid: string;
  Fullname: string;
  Phonenumber: string;
  UserId: number;
  TotalAmount: number;
  Checked: boolean;
  Date: string;
  details?: InvoiceDetails[];
}

export interface InvoiceDetails {
  Invoice_Details: number;
  Invoiceid: number;
  UserId: number;
  ProductId: number;
  quantity: number;
  price: number;
  total_price: number;
  product?: Product;
  warranty?: Warranty;
}

export interface Warranty {
  warrantyid: number;
  userid: number;
  invoicedetailid: number;
  branchid: number;
  warrantycode: string;
  ProductId: number;
  startdate: string;
  expirydate: string;
  status: string;
}

// Function to convert to Persian date
export const toPersianDate = (dateString: string) => {
  try {
    const date = new Date(dateString);

    // Format date to Persian (fa-IR)
    const formatter = new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return formatter.format(date);
  } catch (error) {
    console.error(error);
    return "تاریخ نامشخص";
  }
};
