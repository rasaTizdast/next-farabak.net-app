import axios from "axios";

export const addNewInvoice = async (invoice, user) => {
  const productNames = invoice.products.map((p) => p.name);
  const productAmounts = invoice.products.map((p) => p.amount);
  try {
    const res = axios.post("/api/invoice", {
      Fullname: `${user.firstName} ${user.lastName}`,
      Phonenumber: user.phoneNumber,
      TotalAmount: invoice.totalItems,
      ProductName: productNames.toString(),
      Quantity: productAmounts.toString(),
      UserId: user.userId,
    });
    return res;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getuserInvoices = async () => {
  try {
    const res = axios.get("/api/invoice");
    return (await res).data;
  } catch (error) {
    throw new Error(error);
  }
};

export const checkUserInvoice = async (guid: string) => {
  try {
    const res = axios.patch("/api/invoice", {
      FactorGuid: guid,
    });
    return (await res).data;
  } catch (error) {
    throw new Error(error.message);
  }
};
