import { NextRequest } from "next/server";
import { z } from "zod";
import { errorResponse } from "./api-response";

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  price: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  categoryId: z.string().min(1, "دسته‌بندی الزامی است"),
  description: z.string().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createInvoiceSchema = z.object({
  branchId: z.string().min(1, "شعبه الزامی است"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
        price: z.number().min(0),
      })
    )
    .min(1, "حداقل یک آیتم الزامی است"),
});

export const createBlogSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: z.string().min(1, "slug الزامی است"),
  content: z.string().min(1, "محتوا الزامی است"),
});

export const loginSchema = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export const signupSchema = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  name: z.string().min(1, "نام الزامی است"),
});

export async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<{ data: z.infer<T> } | { error: Response }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.issues.map((e) => e.message).join(", ");
      return { error: errorResponse(errorMessage, 400) };
    }
    return { data: result.data };
  } catch {
    return { error: errorResponse("Invalid JSON body", 400) };
  }
}

export function validateParams<T extends z.ZodType>(
  params: Record<string, string>,
  schema: T
): { data: z.infer<T> } | { error: Response } {
  const result = schema.safeParse(params);
  if (!result.success) {
    const errorMessage = result.error.issues.map((e) => e.message).join(", ");
    return { error: errorResponse(errorMessage, 400) };
  }
  return { data: result.data };
}
