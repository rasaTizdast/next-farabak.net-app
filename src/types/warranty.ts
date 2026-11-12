export interface Warranty {
  id: string;
  warrantyCode: string;
  startDate: string;
  expiryDate: string;
  status: "Active" | "Expired";
  productId: string;
  branchId: string;
}

export interface CreateWarrantyRequest {
  warrantyCode: string;
  startDate: string;
  expiryDate: string;
  productId: string;
  branchId: string;
}
