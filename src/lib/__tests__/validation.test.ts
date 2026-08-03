import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
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
} from "@/lib/validation";

function assertSuccess<T>(result: { success: true; data: T } | { success: false; error: unknown }): asserts result is { success: true; data: T } {
  if (!result.success) throw new Error("Expected success");
}

function assertError<T>(result: { success: true; data: T } | { success: false; error: unknown }): asserts result is { success: false; error: unknown } {
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
        name: "Product 1",
        price: 1000,
        categoryId: "cat-1",
        description: "Description",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects missing name", () => {
      const result = createProductSchema.safeParse({
        price: 1000,
        categoryId: "cat-1",
      });
      expect(result.success).toBe(false);
      assertError(result);
      // zod v4 gives "Invalid input: expected string, received undefined" for missing required fields
      expect(result.error.issues[0].message).toContain("Invalid input");
    });

    it("rejects negative price", () => {
      const result = createProductSchema.safeParse({
        name: "Product",
        price: -100,
        categoryId: "cat-1",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("قیمت نمی‌تواند منفی باشد");
    });
  });

  describe("updateProductSchema", () => {
    it("allows partial updates", () => {
      const result = updateProductSchema.safeParse({ name: "Updated" });
      expect(result.success).toBe(true);
      assertSuccess(result);
      expect(result.data.name).toBe("Updated");
    });
  });

  describe("createInvoiceSchema", () => {
    it("validates complete invoice", () => {
      const result = createInvoiceSchema.safeParse({
        branchId: "branch-1",
        items: [
          { productId: "prod-1", quantity: 2, price: 500 },
        ],
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects empty items", () => {
      const result = createInvoiceSchema.safeParse({
        branchId: "branch-1",
        items: [],
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
      // zod v4 gives "Invalid input: expected string, received undefined" for missing required fields
      expect(result.error.issues[0].message).toContain("Invalid input");
    });
  });

  describe("loginSchema", () => {
    it("validates valid credentials", () => {
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "password",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("ایمیل نامعتبر است");
    });
  });

  describe("signupSchema", () => {
    it("validates valid signup data", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
      expect(result.success).toBe(true);
      assertSuccess(result);
    });

    it("rejects short password", () => {
      const result = signupSchema.safeParse({
        email: "test@example.com",
        password: "123",
        name: "Test",
      });
      expect(result.success).toBe(false);
      assertError(result);
      expect(result.error.issues[0].message).toBe("رمز عبور باید حداقل ۶ کاراکتر باشد");
    });
  });
});

describe("src/lib/validation.ts - helpers", () => {
  describe("validateBody", () => {
    it("returns data on valid body", async () => {
      const req = new NextRequest("http://test", {
        method: "POST",
        body: JSON.stringify({ name: "Test", price: 100, categoryId: "cat" }),
      });

      const result = await validateBody(req, createProductSchema);
      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data.name).toBe("Test");
      }
    });

    it("returns error on invalid body", async () => {
      const req = new NextRequest("http://test", {
        method: "POST",
        body: JSON.stringify({ price: 100 }), // missing name
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
  });
});