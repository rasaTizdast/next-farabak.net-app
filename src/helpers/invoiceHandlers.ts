import axios from "axios";

interface Invoice {
  products: { ProductId: number; Quantity: number; Price?: number }[];
  TotalAmount: number;
}

type UserType = {
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

// Add new invoice
export const addNewInvoice = async (
  invoice: Invoice,
  user: UserType | null
) => {
  try {
    const res = await axios.post("/api/invoice", {
      Fullname: `${user?.firstName} ${user?.lastName}`,
      Phonenumber: user?.phoneNumber,
      TotalAmount: invoice.TotalAmount,
      Products: invoice.products,
      UserId: user?.userId,
    });
    return res.data; // Return the data instead of the whole response
  } catch (error: unknown) {
    // Handle error and check for AxiosError structure
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error adding invoice");
    } else if (error instanceof Error) {
      throw new Error(
        error.message || "Unknown error occurred while adding invoice"
      );
    }
    throw new Error("Unknown error occurred while adding invoice");
  }
};

// Get user invoices
export const getUserInvoices = async () => {
  try {
    const res = await axios.get("/api/invoice");
    return res.data; // Return the data instead of the whole response
  } catch (error: unknown) {
    // Handle error and check for AxiosError structure
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error fetching invoices"
      );
    } else if (error instanceof Error) {
      throw new Error(
        error.message || "Unknown error occurred while fetching invoices"
      );
    }
    throw new Error("Unknown error occurred while fetching invoices");
  }
};

// Check user invoice by GUID
export const checkUserInvoice = async (guid: string) => {
  try {
    const res = await axios.patch("/api/invoice", {
      FactorGuid: guid,
    });
    return res.data; // Return the data instead of the whole response
  } catch (error: unknown) {
    // Handle error and check for AxiosError structure
    if (axios.isAxiosError(error)) {
      throw new Error(
        error.response?.data?.message || "Error checking invoice"
      );
    } else if (error instanceof Error) {
      throw new Error(
        error.message || "Unknown error occurred while checking invoice"
      );
    }
    throw new Error("Unknown error occurred while checking invoice");
  }
};