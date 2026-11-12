export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  description?: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  categoryId: string;
  description?: string;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;
