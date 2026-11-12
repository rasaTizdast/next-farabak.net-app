export interface Branch {
  id: string;
  name: string;
  location: string;
  userId?: string;
}

export interface CreateBranchRequest {
  name: string;
  location: string;
  userId: string;
}

export type UpdateBranchRequest = Partial<CreateBranchRequest>;
