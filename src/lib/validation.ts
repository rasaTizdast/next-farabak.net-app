import { z } from "zod";

import { errorResponse } from "./api-response";

// Common schemas
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  username: z.string({ error: "نام کاربری الزامی است" }).min(1, "نام کاربری الزامی است"),
  password: z.string({ error: "رمز عبور الزامی است" }).min(1, "رمز عبور الزامی است"),
});

export const signupSchema = z.object({
  username: z.string({ error: "نام کاربری الزامی است" }).min(1, "نام کاربری الزامی است"),
  firstName: z.string({ error: "نام الزامی است" }).min(1, "نام الزامی است"),
  lastName: z.string({ error: "نام خانوادگی الزامی است" }).min(1, "نام خانوادگی الزامی است"),
  phoneNumber: z.string({ error: "شماره تماس الزامی است" }).min(1, "شماره تماس الزامی است"),
  email: z.string({ error: "ایمیل الزامی است" }).email("ایمیل نامعتبر است"),
  city: z.string({ error: "شهر الزامی است" }).min(1, "شهر الزامی است"),
  job: z.string({ error: "شغل الزامی است" }).min(1, "شغل الزامی است"),
  password: z.string({ error: "رمز عبور الزامی است" }).min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: "رمز عبور فعلی الزامی است" })
    .min(1, "رمز عبور فعلی الزامی است"),
  newPassword: z
    .string({ error: "رمز عبور جدید الزامی است" })
    .min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد"),
});

export const profileUpdateSchema = z
  .object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phoneNumber: z.string().min(1).optional(),
    email: z.string().email("ایمیل نامعتبر است").optional(),
    city: z.string().min(1).optional(),
    job: z.string().min(1).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "هیچ داده‌ای برای به‌روزرسانی ارائه نشده است",
  });

export const forgotPasswordSchema = z.object({
  email: z.string({ error: "ایمیل الزامی است" }).email("ایمیل نامعتبر است"),
});

export const resetPasswordSchema = z.object({
  email: z.string({ error: "ایمیل الزامی است" }).email("ایمیل نامعتبر است"),
  code: z.string({ error: "کد بازیابی الزامی است" }).min(1, "کد بازیابی الزامی است"),
  newPassword: z
    .string({ error: "رمز عبور جدید الزامی است" })
    .min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد"),
  resetToken: z.string({ error: "توکن بازیابی الزامی است" }).min(1, "توکن بازیابی الزامی است"),
});

export const verifyResetCodeSchema = z.object({
  email: z.string({ error: "ایمیل الزامی است" }).email("ایمیل نامعتبر است"),
  code: z.string({ error: "کد بازیابی الزامی است" }).min(1, "کد بازیابی الزامی است"),
  resetToken: z.string({ error: "توکن بازیابی الزامی است" }).min(1, "توکن بازیابی الزامی است"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string({ error: "توکن بازیابی الزامی است" }).min(1, "توکن بازیابی الزامی است"),
});

// ---------------------------------------------------------------------------
// Product schemas (PascalCase — mirrors the Prisma model / route bodies)
// ---------------------------------------------------------------------------

export const createProductSchema = z.object({
  Type: z.string({ error: "نوع محصول الزامی است" }).min(1, "نوع محصول الزامی است"),
  Slug: z.string({ error: "اسلاگ الزامی است" }).min(1, "اسلاگ الزامی است"),
  Description: z.string({ error: "توضیحات الزامی است" }).min(1, "توضیحات الزامی است"),
  CategoryId: z.coerce
    .number({ error: "دسته‌بندی الزامی است" })
    .int()
    .min(1, "دسته‌بندی الزامی است"),
  CategoryContentId: z.string({ error: "زیردسته الزامی است" }).min(1, "زیردسته الزامی است"),
  Available: z.boolean({ error: "وضعیت موجودی الزامی است" }),
  Price: z.string({ error: "قیمت الزامی است" }).min(1, "قیمت الزامی است"),
  Discount: z.string({ error: "تخفیف الزامی است" }).min(1, "تخفیف الزامی است"),
  Name: z.string({ error: "نام محصول الزامی است" }).min(1, "نام محصول الزامی است"),
  SEO_Title: z.string({ error: "عنوان سئو الزامی است" }).min(1, "عنوان سئو الزامی است"),
  SEO_Description: z.string({ error: "توضیحات سئو الزامی است" }).min(1, "توضیحات سئو الزامی است"),
  img1: z.string().default(""),
  img2: z.string().default(""),
  productBlog: z.string().default(""),
});

export const updateProductSchema = z.object({
  Name: z.string().optional(),
  Type: z.string().optional(),
  Price: z.string().optional(),
  Discount: z.string().optional(),
  CategoryContentId: z.string().optional(),
  img1: z.string().optional(),
  img2: z.string().optional(),
  Available: z.boolean().optional(),
  Description: z.string().optional(),
  CategoryId: z.coerce.number().int().optional(),
  Slug: z.string().optional(),
  SEO_Title: z.string().optional(),
  SEO_Description: z.string().optional(),
  productBlog: z.string().optional(),
  Partner_Price: z.string().optional(),
});

export const updateProductImagesSchema = z
  .object({
    img1: z.string().optional(),
    img2: z.string().optional(),
  })
  .refine((value) => value.img1 !== undefined || value.img2 !== undefined, {
    message: "حداقل یکی از تصاویر الزامی است",
  });

export const amountLimitsSchema = z
  .object({
    minimum_amount: z.number().min(0, "حداقل مقدار نمی‌تواند منفی باشد").nullable().optional(),
    maximum_amount: z.number().min(0, "حداکثر مقدار نمی‌تواند منفی باشد").nullable().optional(),
  })
  .refine(
    (value) =>
      value.minimum_amount == null ||
      value.maximum_amount == null ||
      value.minimum_amount <= value.maximum_amount,
    { message: "حداقل مقدار نمی‌تواند بیشتر از حداکثر مقدار باشد" }
  );

// ---------------------------------------------------------------------------
// Branch schemas
// ---------------------------------------------------------------------------

export const createBranchSchema = z.object({
  userId: z.coerce.number().int().min(1, "شناسه کاربر الزامی است"),
  name: z.string().min(1, "نام شعبه الزامی است"),
  location: z.string().min(1, "موقعیت شعبه الزامی است"),
});

export const updateBranchSchema = z.object({
  name: z.string().min(1, "نام شعبه الزامی است"),
  location: z.string().min(1, "موقعیت شعبه الزامی است"),
});

export const assignBranchProductSchema = z.object({
  productId: z.coerce.number().int().min(1, "شناسه محصول الزامی است"),
  quantity: z.coerce.number().int().min(0, "مقدار نمی‌تواند منفی باشد"),
});

export const updateBranchProductSchema = z.object({
  quantity: z.coerce.number().int().min(0, "مقدار نمی‌تواند منفی باشد"),
});

// ---------------------------------------------------------------------------
// Warehouse schemas
// ---------------------------------------------------------------------------

export const createWarehouseSchema = z.object({
  name: z.string().min(1, "نام انبار الزامی است"),
  location: z.string().optional(),
});

export const updateWarehouseSchema = z.object({
  name: z.string().optional(),
  location: z.string().optional(),
});

export const assignWarehouseProductSchema = z.object({
  productId: z.coerce.number().int().min(1, "شناسه محصول الزامی است"),
  quantity: z.coerce.number().int().min(0, "مقدار نمی‌تواند منفی باشد"),
  ProductGradeId: z.coerce.number().int().nullable().optional(),
});

export const updateWarehouseProductSchema = z
  .object({
    quantity: z.coerce.number().int().min(0, "مقدار نمی‌تواند منفی باشد").optional(),
    ProductGradeId: z.coerce.number().int().nullable().optional(),
  })
  .refine((value) => value.quantity !== undefined || value.ProductGradeId !== undefined, {
    message: "حداقل یک فیلد برای به‌روزرسانی الزامی است",
  });

// ---------------------------------------------------------------------------
// Invoice schemas
// ---------------------------------------------------------------------------

export const invoiceProductSchema = z.object({
  ProductId: z.coerce.number().int().min(1),
  quantity: z.coerce.number().int().min(1, "حداقل یک آیتم الزامی است"),
  price: z.coerce.number().min(0),
  total_price: z.coerce.number().min(0),
  warranty: z
    .object({
      hasWarranty: z.boolean(),
      warrantycode: z.string(),
      startdate: z.string(),
      expirydate: z.string(),
    })
    .optional(),
});

export const invoiceDataSchema = z.object({
  Fullname: z.string().min(1, "نام مشتری الزامی است"),
  Phonenumber: z.string().min(1, "شماره تماس الزامی است"),
  TotalAmount: z.coerce.number().min(0),
  Date: z.string().min(1, "تاریخ الزامی است"),
  UserId: z.coerce.number().int(),
  products: z.array(invoiceProductSchema).min(1, "حداقل یک آیتم الزامی است"),
});

export const createInvoiceSchema = z.object({
  branchId: z.coerce.number({ error: "شعبه الزامی است" }).int().positive("شعبه الزامی است"),
  invoiceData: invoiceDataSchema,
});

export const updateInvoiceSchema = z.object({
  checked: z.boolean(),
});

// ---------------------------------------------------------------------------
// Product query / param schemas
// ---------------------------------------------------------------------------

export const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  q: z.string().optional(),
  category: z.coerce.number().int().default(0),
  subcategory: z.string().optional(),
  available: z.enum(["true", "false", "all"]).optional(),
});

export const productIdParamSchema = z.object({
  productId: z.coerce.number().int().positive("شناسه محصول نامعتبر است"),
});

// ---------------------------------------------------------------------------
// Branch query / param schemas
// ---------------------------------------------------------------------------

export const branchQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  productId: z.coerce.number().int().positive().optional(),
});

export const branchIdParamSchema = z.object({
  branchId: z.coerce.number().int().positive("شناسه شعبه نامعتبر است"),
});

export const branchProductQuerySchema = z.object({
  productId: z.coerce.number().int().positive("شناسه محصول الزامی است"),
});

export const checkProductQuerySchema = z.object({
  branchId: z.coerce.number().int().positive("شناسه شعبه الزامی است"),
  productId: z.coerce.number().int().positive("شناسه محصول الزامی است"),
  invoiceId: z.coerce.number().int().positive("شناسه فاکتور الزامی است"),
});

// ---------------------------------------------------------------------------
// Warehouse query / param schemas
// ---------------------------------------------------------------------------

export const warehouseQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
  productId: z.coerce.number().int().positive().optional(),
});

export const warehouseIdParamSchema = z.object({
  warehouseId: z.coerce.number().int().positive("شناسه انبار نامعتبر است"),
});

// ---------------------------------------------------------------------------
// Invoice param schemas
// ---------------------------------------------------------------------------

export const invoiceIdParamSchema = z.object({
  invoiceId: z.coerce.number().int().positive("شناسه فاکتور نامعتبر است"),
});

// ---------------------------------------------------------------------------
// User/admin schemas
// ---------------------------------------------------------------------------

export const userSearchSchema = z
  .object({
    phoneNumber: z.string().min(1).optional(),
    userId: z.coerce.number().int().positive().optional(),
  })
  .refine((value) => value.phoneNumber !== undefined || value.userId !== undefined, {
    message: "شماره تماس یا شناسه کاربر الزامی است",
  });

export const userIdSchema = z.object({
  userId: z.coerce.number().int().min(1, "شناسه کاربر الزامی است"),
});

// ---------------------------------------------------------------------------
// Blog schemas
// ---------------------------------------------------------------------------

export const createBlogSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: z.string().min(1, "slug الزامی است"),
  content: z.string().min(1, "محتوا الزامی است"),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function validateBody<T extends z.ZodType>(
  request: Request,
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
  params: Record<string, string | undefined>,
  schema: T
): { data: z.infer<T> } | { error: Response } {
  const result = schema.safeParse(params);
  if (!result.success) {
    const errorMessage = result.error.issues.map((e) => e.message).join(", ");
    return { error: errorResponse(errorMessage, 400) };
  }
  return { data: result.data };
}
