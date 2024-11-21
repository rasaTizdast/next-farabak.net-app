import axios from "axios";

export const addNewInvoice = async (invoice, user) => {
  const productNames = invoice.products.map((p) => p.name);
  const productAmounts = invoice.products.map((p) => p.amount);

  const res = axios.post("/api/invoice", {
    Fullname: `${user.firstName} ${user.lastName}`,
    Phonenumber: user.phoneNumber,
    TotalAmount: invoice.totalItems,
    ProductName: productNames.toString(),
    Quantity: productAmounts.toString(),
    UserId: user.userId,
  });
  return res;
};
