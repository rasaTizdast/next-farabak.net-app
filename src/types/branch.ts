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

export interface UpdateBranchRequest extends Partial<CreateBranchRequest> {}
