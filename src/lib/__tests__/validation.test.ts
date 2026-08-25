import { NextRequest } from "next/server";
import { describe, it, expect } from "vitest";

import {
  idParamSchema,
  paginationSchema,
  createProductSchema,
  updateProductSchema,
  createInvoiceSchema,
  createBlogSchema,
  loginSchema,
  signupSchema,
  validateBody,
  validateParams,
  changePasswordSchema,
  profileUpdateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyResetCodeSchema,
  refreshTokenSchema,
  updateProductImagesSchema,
  amountLimitsSchema,
  createBranchSchema,
  updateBranchSchema,
  assignBranchProductSchema,
  updateBranchProductSchema,
  createWarehouseSchema,
  updateWarehouseSchema,
  assignWarehouseProductSchema,
  updateWarehouseProductSchema,
  invoiceProductSchema,
  invoiceDataSchema,
  updateInvoiceSchema,
  productsQuerySchema,
  productIdParamSchema,
  branchQuerySchema,
  branchIdParamSchema,
  branchProductQuerySchema,
  checkProductQuerySchema,
  warehouseQuerySchema,
  warehouseIdParamSchema,
  invoiceIdParamSchema,
  userSearchSchema,
  userIdSchema,
} from "@/lib/validation";

function assertSuccess<T>(
  result: { success: true; data: T } | { success: false; error: unknown }
): asserts result is { success: true; data: T } {
  if (!result.success) throw new Error("Expected success");
}

function assertError<T>(
  result: { success: true; data: T } | { success: false; error: unknown }
): asserts result is { success: false; error: unknown } {
  if (result.success) throw new Error("Expected error");
}

describe("src/lib/validation.ts - schemas", () => {
  describe("idParamSchema", () => {
    it("validates valid id", () => {
      const result = idParamSchema.safeParse({ id: "123" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.id).toBe("123");
    });

    it("rejects empty id", () => {
      const result = idParamSchema.safeParse({ id: "" });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("ID is required");
    });

    it("rejects missing id", () => {
      const result = idParamSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("paginationSchema", () => {
    it("parses valid page and pageSize", () => {
      const result = paginationSchema.safeParse({ page: "2", pageSize: "50" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.page).toBe(2);
      expect(result.data.pageSize).toBe(50);
    });

    it("defaults page to 1 and pageSize to 20", () => {
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(20);
    });

    it("rejects page < 1", () => {
      const result = paginationSchema.safeParse({ page: "0" });
      expect(result.success).toBe(false);
    });

    it("rejects pageSize > 100", () => {
      const result = paginationSchema.safeParse({ pageSize: "200" });
      expect(result.success).toBe(false);
    });
  });

  describe("createProductSchema", () => {
    it("validates complete product", () => {
      const result = createProductSchema.safeParse({
        Type: "Smart Watch",
        Slug: "smart-watch",
        Description: "Description",
        CategoryId: 1,
        CategoryContentId: "101",
        Available: true,
        Price: "199.99",
        Discount: "10",
        Name: "Smart Watch",
        SEO_Title: "Buy Smart Watch",
        SEO_Description: "Best smart watch",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.Type).toBe("Smart Watch");
    });

    it("rejects missing Type", () => {
      const result = createProductSchema.safeParse({
        Slug: "smart-watch",
        Description: "Description",
        CategoryId: 1,
        CategoryContentId: "101",
        Available: true,
        Price: "199.99",
        Discount: "10",
        Name: "Smart Watch",
        SEO_Title: "Buy Smart Watch",
        SEO_Description: "Best smart watch",
      });
      expect(result.success).toBe(false);
      assertError(result);
    });

    it("rejects negative category id", () => {
      const result = createProductSchema.safeParse({
        Type: "Smart Watch",
        Slug: "smart-watch",
        Description: "Description",
        CategoryId: -5,
        CategoryContentId: "101",
        Available: true,
        Price: "199.99",
        Discount: "10",
        Name: "Smart Watch",
        SEO_Title: "Buy Smart Watch",
        SEO_Description: "Best smart watch",
      });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("updateProductSchema", () => {
    it("allows partial updates", () => {
      const result = updateProductSchema.safeParse({ Name: "Updated" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.Name).toBe("Updated");
    });
  });

  describe("createInvoiceSchema", () => {
    it("validates complete invoice", () => {
      const result = createInvoiceSchema.safeParse({
        branchId: 1,
        invoiceData: {
          Fullname: "Ali",
          Phonenumber: "0912",
          TotalAmount: 5000,
          Date: "2026-08-19",
          UserId: 1,
          products: [{ ProductId: 1, quantity: 2, price: 500, total_price: 1000 }],
        },
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects empty products", () => {
      const result = createInvoiceSchema.safeParse({
        branchId: 1,
        invoiceData: {
          Fullname: "Ali",
          Phonenumber: "0912",
          TotalAmount: 5000,
          Date: "2026-08-19",
          UserId: 1,
          products: [],
        },
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("حداقل یک آیتم الزامی است");
    });
  });

  describe("createBlogSchema", () => {
    it("validates complete blog", () => {
      const result = createBlogSchema.safeParse({
        title: "Blog Title",
        slug: "blog-title",
        content: "Content",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects missing title", () => {
      const result = createBlogSchema.safeParse({ slug: "x", content: "c" });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("loginSchema", () => {
    it("validates valid credentials", () => {
      const result = loginSchema.safeParse({
        username: "ali",
        password: "password",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects empty username", () => {
      const result = loginSchema.safeParse({
        username: "",
        password: "password",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("نام کاربری الزامی است");
    });
  });

  describe("signupSchema", () => {
    it("validates valid signup data", () => {
      const result = signupSchema.safeParse({
        username: "ali",
        firstName: "Ali",
        lastName: "Ahmadi",
        phoneNumber: "0912",
        email: "ali@test.com",
        city: "Tehran",
        job: "Engineer",
        password: "password123",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects short password", () => {
      const result = signupSchema.safeParse({
        username: "ali",
        firstName: "Ali",
        lastName: "Ahmadi",
        phoneNumber: "0912",
        email: "ali@test.com",
        city: "Tehran",
        job: "Engineer",
        password: "123",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("رمز عبور باید حداقل ۶ کاراکتر باشد");
    });

    it("rejects invalid email", () => {
      const result = signupSchema.safeParse({
        username: "ali",
        firstName: "Ali",
        lastName: "Ahmadi",
        phoneNumber: "0912",
        email: "not-an-email",
        city: "Tehran",
        job: "Engineer",
        password: "password123",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("ایمیل نامعتبر است");
    });
  });

  describe("changePasswordSchema", () => {
    it("validates valid password change", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "old-password",
        newPassword: "new-password",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects missing current password", () => {
      const result = changePasswordSchema.safeParse({ newPassword: "new-password" });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("رمز عبور فعلی الزامی است");
    });

    it("rejects short new password", () => {
      const result = changePasswordSchema.safeParse({
        currentPassword: "old-password",
        newPassword: "123",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
    });
  });

  describe("profileUpdateSchema", () => {
    it("validates partial update with one field", () => {
      const result = profileUpdateSchema.safeParse({ firstName: "Ali" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.firstName).toBe("Ali");
    });

    it("rejects empty object (refine)", () => {
      const result = profileUpdateSchema.safeParse({});
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("هیچ داده‌ای برای به‌روزرسانی ارائه نشده است");
    });

    it("rejects invalid email", () => {
      const result = profileUpdateSchema.safeParse({ email: "not-an-email" });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("ایمیل نامعتبر است");
    });
  });

  describe("forgotPasswordSchema", () => {
    it("validates a valid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "ali@test.com" });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects invalid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "bad" });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("ایمیل نامعتبر است");
    });

    it("rejects missing email", () => {
      const result = forgotPasswordSchema.safeParse({});
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("ایمیل الزامی است");
    });
  });

  describe("resetPasswordSchema", () => {
    it("validates a complete reset payload", () => {
      const result = resetPasswordSchema.safeParse({
        email: "ali@test.com",
        code: "123456",
        newPassword: "new-password",
        resetToken: "token",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects missing code", () => {
      const result = resetPasswordSchema.safeParse({
        email: "ali@test.com",
        newPassword: "new-password",
        resetToken: "token",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("کد بازیابی الزامی است");
    });

    it("rejects short new password", () => {
      const result = resetPasswordSchema.safeParse({
        email: "ali@test.com",
        code: "123456",
        newPassword: "123",
        resetToken: "token",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("رمز عبور جدید باید حداقل ۶ کاراکتر باشد");
    });
  });

  describe("verifyResetCodeSchema", () => {
    it("validates a complete verify payload", () => {
      const result = verifyResetCodeSchema.safeParse({
        email: "ali@test.com",
        code: "123456",
        resetToken: "token",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects missing code", () => {
      const result = verifyResetCodeSchema.safeParse({
        email: "ali@test.com",
        resetToken: "token",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("کد بازیابی الزامی است");
    });
  });

  describe("refreshTokenSchema", () => {
    it("validates a non-empty refresh token", () => {
      const result = refreshTokenSchema.safeParse({ refreshToken: "some-token" });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects empty refresh token", () => {
      const result = refreshTokenSchema.safeParse({ refreshToken: "" });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("توکن بازیابی الزامی است");
    });
  });

  describe("createProductSchema - more paths", () => {
    const completeProduct = {
      Type: "Smart Watch",
      Slug: "smart-watch",
      Description: "Description",
      CategoryId: "2",
      CategoryContentId: "101",
      Available: true,
      Price: "199.99",
      Discount: "10",
      Name: "Smart Watch",
      SEO_Title: "Buy Smart Watch",
      SEO_Description: "Best smart watch",
    };

    it("coerces CategoryId and applies string defaults", () => {
      const result = createProductSchema.safeParse(completeProduct);
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.CategoryId).toBe(2);
      expect(result.data.img1).toBe("");
      expect(result.data.img2).toBe("");
      expect(result.data.productBlog).toBe("");
    });

    it("rejects non-boolean Available", () => {
      const result = createProductSchema.safeParse({
        ...completeProduct,
        Available: "yes",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("وضعیت موجودی الزامی است");
    });

    it("rejects missing Name", () => {
      const result = createProductSchema.safeParse({ ...completeProduct, Name: undefined });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("نام محصول الزامی است");
    });
  });

  describe("updateProductSchema - more paths", () => {
    it("accepts an empty object (all fields optional)", () => {
      const result = updateProductSchema.safeParse({});
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects non-numeric CategoryId", () => {
      const result = updateProductSchema.safeParse({ CategoryId: "abc" });
      expect(result.success).toBe(false);
      assertError(result);
    });

    it("coerces a numeric string CategoryId", () => {
      const result = updateProductSchema.safeParse({ CategoryId: "7" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.CategoryId).toBe(7);
    });
  });

  describe("updateProductImagesSchema", () => {
    it("validates with only img1", () => {
      const result = updateProductImagesSchema.safeParse({ img1: "a.jpg" });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("validates with only img2", () => {
      const result = updateProductImagesSchema.safeParse({ img2: "b.jpg" });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects empty object (refine)", () => {
      const result = updateProductImagesSchema.safeParse({});
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("حداقل یکی از تصاویر الزامی است");
    });
  });

  describe("amountLimitsSchema", () => {
    it("validates min <= max", () => {
      const result = amountLimitsSchema.safeParse({ minimum_amount: 10, maximum_amount: 100 });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("validates null combinations", () => {
      expect(
        amountLimitsSchema.safeParse({ minimum_amount: null, maximum_amount: null }).success
      ).toBe(true);
      expect(amountLimitsSchema.safeParse({ minimum_amount: 5 }).success).toBe(true);
      expect(amountLimitsSchema.safeParse({ maximum_amount: 5 }).success).toBe(true);
    });

    it("rejects min > max (refine)", () => {
      const result = amountLimitsSchema.safeParse({ minimum_amount: 100, maximum_amount: 10 });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe(
        "حداقل مقدار نمی‌تواند بیشتر از حداکثر مقدار باشد"
      );
    });

    it("rejects negative minimum", () => {
      const result = amountLimitsSchema.safeParse({ minimum_amount: -1 });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("حداقل مقدار نمی‌تواند منفی باشد");
    });
  });

  describe("createBranchSchema", () => {
    it("validates a complete branch", () => {
      const result = createBranchSchema.safeParse({
        userId: "1",
        name: "Branch A",
        location: "Tehran",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.userId).toBe(1);
    });

    it("rejects missing name", () => {
      const result = createBranchSchema.safeParse({ userId: 1, location: "Tehran" });
      expect(result.success).toBe(false);
      assertError(result);
    });

    it("rejects invalid userId", () => {
      const result = createBranchSchema.safeParse({ userId: 0, name: "A", location: "T" });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("شناسه کاربر الزامی است");
    });
  });

  describe("updateBranchSchema", () => {
    it("validates name and location", () => {
      const result = updateBranchSchema.safeParse({ name: "A", location: "T" });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects missing name", () => {
      const result = updateBranchSchema.safeParse({ location: "T" });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("assignBranchProductSchema", () => {
    it("validates product and quantity", () => {
      const result = assignBranchProductSchema.safeParse({ productId: "1", quantity: "3" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.productId).toBe(1);
    });

    it("rejects negative quantity", () => {
      const result = assignBranchProductSchema.safeParse({ productId: 1, quantity: -2 });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("مقدار نمی‌تواند منفی باشد");
    });

    it("rejects missing productId", () => {
      const result = assignBranchProductSchema.safeParse({ quantity: 2 });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("updateBranchProductSchema", () => {
    it("validates quantity", () => {
      const result = updateBranchProductSchema.safeParse({ quantity: "5" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.quantity).toBe(5);
    });

    it("rejects negative quantity", () => {
      const result = updateBranchProductSchema.safeParse({ quantity: -1 });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("مقدار نمی‌تواند منفی باشد");
    });
  });

  describe("createWarehouseSchema", () => {
    it("validates a warehouse without location", () => {
      const result = createWarehouseSchema.safeParse({ name: "Warehouse A" });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects missing name", () => {
      const result = createWarehouseSchema.safeParse({});
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("updateWarehouseSchema", () => {
    it("accepts partial updates", () => {
      const result = updateWarehouseSchema.safeParse({ name: "W" });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("accepts an empty object", () => {
      const result = updateWarehouseSchema.safeParse({});
      expect(result.success).toBe(true);
      assertSuccess(result);
    });
  });

  describe("assignWarehouseProductSchema", () => {
    it("validates product, quantity and null ProductGradeId", () => {
      const result = assignWarehouseProductSchema.safeParse({
        productId: "1",
        quantity: "2",
        ProductGradeId: null,
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.productId).toBe(1);
    });

    it("validates without ProductGradeId", () => {
      const result = assignWarehouseProductSchema.safeParse({ productId: 1, quantity: 2 });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects negative quantity", () => {
      const result = assignWarehouseProductSchema.safeParse({ productId: 1, quantity: -3 });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("مقدار نمی‌تواند منفی باشد");
    });
  });

  describe("updateWarehouseProductSchema", () => {
    it("validates with quantity only", () => {
      const result = updateWarehouseProductSchema.safeParse({ quantity: 2 });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("validates with ProductGradeId only", () => {
      const result = updateWarehouseProductSchema.safeParse({ ProductGradeId: 2 });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects empty object (refine)", () => {
      const result = updateWarehouseProductSchema.safeParse({});
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("حداقل یک فیلد برای به‌روزرسانی الزامی است");
    });
  });

  describe("invoiceProductSchema", () => {
    it("validates a product line item", () => {
      const result = invoiceProductSchema.safeParse({
        ProductId: 1,
        quantity: 2,
        price: 500,
        total_price: 1000,
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("validates a line item with warranty", () => {
      const result = invoiceProductSchema.safeParse({
        ProductId: 1,
        quantity: 1,
        price: 100,
        total_price: 100,
        warranty: {
          hasWarranty: true,
          warrantycode: "W123",
          startdate: "2026-01-01",
          expirydate: "2027-01-01",
        },
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects zero quantity", () => {
      const result = invoiceProductSchema.safeParse({
        ProductId: 1,
        quantity: 0,
        price: 500,
        total_price: 0,
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("حداقل یک آیتم الزامی است");
    });

    it("rejects negative price", () => {
      const result = invoiceProductSchema.safeParse({
        ProductId: 1,
        quantity: 1,
        price: -5,
        total_price: -5,
      });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("invoiceDataSchema", () => {
    it("validates complete invoice data", () => {
      const result = invoiceDataSchema.safeParse({
        Fullname: "Ali",
        Phonenumber: "0912",
        TotalAmount: "5000",
        Date: "2026-08-19",
        UserId: 1,
        products: [{ ProductId: 1, quantity: 2, price: 500, total_price: 1000 }],
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.TotalAmount).toBe(5000);
    });

    it("rejects empty products", () => {
      const result = invoiceDataSchema.safeParse({
        Fullname: "Ali",
        Phonenumber: "0912",
        TotalAmount: 5000,
        Date: "2026-08-19",
        UserId: 1,
        products: [],
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("حداقل یک آیتم الزامی است");
    });

    it("rejects missing Fullname", () => {
      const result = invoiceDataSchema.safeParse({
        Phonenumber: "0912",
        TotalAmount: 5000,
        Date: "2026-08-19",
        UserId: 1,
        products: [{ ProductId: 1, quantity: 2, price: 500, total_price: 1000 }],
      });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("createInvoiceSchema - more paths", () => {
    it("rejects invalid branchId", () => {
      const result = createInvoiceSchema.safeParse({
        branchId: 0,
        invoiceData: {
          Fullname: "Ali",
          Phonenumber: "0912",
          TotalAmount: 5000,
          Date: "2026-08-19",
          UserId: 1,
          products: [{ ProductId: 1, quantity: 2, price: 500, total_price: 1000 }],
        },
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("شعبه الزامی است");
    });
  });

  describe("updateInvoiceSchema", () => {
    it("validates checked boolean", () => {
      const result = updateInvoiceSchema.safeParse({ checked: true });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.checked).toBe(true);
    });

    it("rejects non-boolean checked", () => {
      const result = updateInvoiceSchema.safeParse({ checked: "yes" });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("productsQuerySchema", () => {
    it("validates all fields", () => {
      const result = productsQuerySchema.safeParse({
        page: 2,
        limit: 30,
        q: "watch",
        category: 3,
        subcategory: "smart",
        available: "true",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("applies defaults", () => {
      const result = productsQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(30);
      expect(result.data.category).toBe(0);
    });

    it("rejects page below 1", () => {
      const result = productsQuerySchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
      assertError(result);
    });

    it("rejects limit above 100", () => {
      const result = productsQuerySchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
      assertError(result);
    });

    it("rejects invalid available enum", () => {
      const result = productsQuerySchema.safeParse({ available: "yes" });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("productIdParamSchema", () => {
    it("coerces a valid productId", () => {
      const result = productIdParamSchema.safeParse({ productId: "5" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.productId).toBe(5);
    });

    it("rejects non-numeric productId", () => {
      const result = productIdParamSchema.safeParse({ productId: "abc" });
      expect(result.success).toBe(false);
      assertError(result);
    });

    it("rejects non-positive productId", () => {
      const result = productIdParamSchema.safeParse({ productId: "-1" });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("شناسه محصول نامعتبر است");
    });
  });

  describe("branchQuerySchema", () => {
    it("validates all fields", () => {
      const result = branchQuerySchema.safeParse({ page: 1, limit: 10, productId: 2 });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.productId).toBe(2);
    });

    it("rejects limit above 100", () => {
      const result = branchQuerySchema.safeParse({ limit: 500 });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("branchIdParamSchema", () => {
    it("coerces a valid branchId", () => {
      const result = branchIdParamSchema.safeParse({ branchId: "3" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.branchId).toBe(3);
    });

    it("rejects non-numeric branchId", () => {
      const result = branchIdParamSchema.safeParse({ branchId: "abc" });
      expect(result.success).toBe(false);
      assertError(result);
    });

    it("rejects non-positive branchId", () => {
      const result = branchIdParamSchema.safeParse({ branchId: "0" });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("شناسه شعبه نامعتبر است");
    });
  });

  describe("branchProductQuerySchema", () => {
    it("validates a productId", () => {
      const result = branchProductQuerySchema.safeParse({ productId: "1" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.productId).toBe(1);
    });

    it("rejects non-numeric productId", () => {
      const result = branchProductQuerySchema.safeParse({ productId: "abc" });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("checkProductQuerySchema", () => {
    it("validates all three ids", () => {
      const result = checkProductQuerySchema.safeParse({
        branchId: "1",
        productId: "2",
        invoiceId: "3",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects invalid invoiceId", () => {
      const result = checkProductQuerySchema.safeParse({ branchId: 1, productId: 2, invoiceId: 0 });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("شناسه فاکتور الزامی است");
    });
  });

  describe("warehouseQuerySchema", () => {
    it("validates all fields", () => {
      const result = warehouseQuerySchema.safeParse({ page: 1, limit: 20, q: "x", productId: 2 });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects limit above 100", () => {
      const result = warehouseQuerySchema.safeParse({ limit: 500 });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("warehouseIdParamSchema", () => {
    it("coerces a valid warehouseId", () => {
      const result = warehouseIdParamSchema.safeParse({ warehouseId: "4" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.warehouseId).toBe(4);
    });

    it("rejects non-numeric warehouseId", () => {
      const result = warehouseIdParamSchema.safeParse({ warehouseId: "abc" });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("invoiceIdParamSchema", () => {
    it("coerces a valid invoiceId", () => {
      const result = invoiceIdParamSchema.safeParse({ invoiceId: "5" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.invoiceId).toBe(5);
    });

    it("rejects non-numeric invoiceId", () => {
      const result = invoiceIdParamSchema.safeParse({ invoiceId: "abc" });
      expect(result.success).toBe(false);
      assertError(result);
    });
  });

  describe("userSearchSchema", () => {
    it("validates with phoneNumber", () => {
      const result = userSearchSchema.safeParse({ phoneNumber: "0912" });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("validates with userId", () => {
      const result = userSearchSchema.safeParse({ userId: "1" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.userId).toBe(1);
    });

    it("rejects empty object (refine)", () => {
      const result = userSearchSchema.safeParse({});
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("شماره تماس یا شناسه کاربر الزامی است");
    });
  });

  describe("userIdSchema", () => {
    it("coerces a valid userId", () => {
      const result = userIdSchema.safeParse({ userId: "5" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.userId).toBe(5);
    });

    it("rejects invalid userId", () => {
      const result = userIdSchema.safeParse({ userId: 0 });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("شناسه کاربر الزامی است");
    });
  });
});

describe("src/lib/validation.ts - helpers", () => {
  describe("validateBody", () => {
    it("returns data on valid body", async () => {
      const req = new NextRequest("http://test", {
        method: "POST",
        body: JSON.stringify({
          Type: "Smart Watch",
          Slug: "smart-watch",
          Description: "Description",
          CategoryId: 1,
          CategoryContentId: "101",
          Available: true,
          Price: "199.99",
          Discount: "10",
          Name: "Smart Watch",
          SEO_Title: "Buy Smart Watch",
          SEO_Description: "Best smart watch",
        }),
      });

      const result = await validateBody(req, createProductSchema);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.Name).toBe("Smart Watch");
      }
    });

    it("returns error on invalid body", async () => {
      const req = new NextRequest("http://test", {
        method: "POST",
        body: JSON.stringify({ Slug: "smart-watch" }), // missing required fields
      });

      const result = await validateBody(req, createProductSchema);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error.status).toBe(400);
      }
    });

    it("returns error on malformed JSON", async () => {
      const req = new NextRequest("http://test", {
        method: "POST",
        body: "not json",
      });

      const result = await validateBody(req, createProductSchema);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error.status).toBe(400);
      }
    });

    it("returns error when no body is provided", async () => {
      const req = new NextRequest("http://test", { method: "POST" });

      const result = await validateBody(req, createProductSchema);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error.status).toBe(400);
        const payload = await result.error.json();
        expect(payload.error).toBe("Invalid JSON body");
      }
    });

    it("returns error when body is null", async () => {
      const req = new NextRequest("http://test", {
        method: "POST",
        body: null as unknown as BodyInit,
      });

      const result = await validateBody(req, createProductSchema);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error.status).toBe(400);
      }
    });
  });

  describe("validateParams", () => {
    it("returns data on valid params", () => {
      const result = validateParams({ id: "123" }, idParamSchema);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.id).toBe("123");
      }
    });

    it("returns error on invalid params", () => {
      const result = validateParams({ id: "" }, idParamSchema);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error.status).toBe(400);
      }
    });

    it("returns error on non-numeric coerce param", () => {
      const result = validateParams({ productId: "not-a-number" }, productIdParamSchema);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error.status).toBe(400);
      }
    });

    it("returns error on empty params for coerce schema", () => {
      const result = validateParams({}, invoiceIdParamSchema);
      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error.status).toBe(400);
      }
    });

    it("returns coerced data for valid coerce params", () => {
      const result = validateParams({ branchId: "3" }, branchIdParamSchema);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.branchId).toBe(3);
      }
    });
  });
});
