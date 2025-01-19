export type AdminInvoice = {
  Invoiceid: string;
  FactorGuid: string;
  Fullname: string;
  Phonenumber: string;
  TotalAmount: number;
  Date: string;
  Checked: boolean;
  Invoice_Details: {
    ProductId: string;
    quantity: number;
    price: number;
    total_price: number;
  }[];
};
