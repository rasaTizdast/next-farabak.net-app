export interface SelectedProduct {
  ProductId: number;
  Name: string;
  quantity: number;
  price: number;
  total_price: number;
}

export interface WarrantyInfo {
  hasWarranty: boolean;
  warrantycode: string;
  startdate: string;
  expirydate: string;
  ProductId?: number;
}

export interface ProductWithWarranty extends SelectedProduct {
  singleItemId: string;
  itemIndex: number;
  itemNumber: number;
  warranty: WarrantyInfo;
}

export interface InvoiceFormData {
  Fullname: string;
  Phonenumber: string;
  UserId: number;
  TotalAmount: number;
  Checked: boolean;
  Date: string;
}

export type WarrantyStepProps = {
  selectedProducts: SelectedProduct[];
  branch: import("../../types").Branch;
  productsWithWarranty: ProductWithWarranty[];
  setProductsWithWarranty: React.Dispatch<React.SetStateAction<ProductWithWarranty[]>>;
};

export type ProductSelectionStepProps = {
  branchId: number;
  selectedProducts: SelectedProduct[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<SelectedProduct[]>>;
  usdToRialRate: number | null;
  onUpdate: (products: SelectedProduct[], totalAmount: number) => void;
};

export type ReviewStepProps = {
  invoice: import("../../types").Invoice;
  productsWithWarranty: ProductWithWarranty[];
};

export type CustomerInfoStepProps = {
  invoice: Partial<import("../../types").Invoice>;
  onUpdate: (values: Partial<import("../../types").Invoice>) => void;
};
