export interface Branch {
  branchid: number;
  name: string;
  location: string;
  productCount: number;
  totalQuantity: number; 
  createdat: string;
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
  Type: string;
  quantity: number;
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
    return "تاریخ نامشخص";
  }
}; 