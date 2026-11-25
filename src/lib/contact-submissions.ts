import { z } from "zod";

export const MAX_CONTACT_SUBMISSION_BODY_BYTES = 24_576;

const normalizePhone = (phone: string) =>
  phone.replace(/[\s-]/g, "").replace(/[٠-٩۰-۹]/g, (digit) => {
    const code = digit.charCodeAt(0);
    return String(code - (code >= 0x06f0 ? 0x06f0 : 0x0660));
  });

export const contactSubmissionSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    phone: z
      .string()
      .transform(normalizePhone)
      .refine((phone) => /^\+?[0-9]{8,15}$/.test(phone)),
    project: z.string().trim().max(160).optional().default(""),
    message: z.string().trim().min(10).max(5000),
    website: z.string().optional().default(""),
  })
  .strict();

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
