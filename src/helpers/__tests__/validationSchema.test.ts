import { describe, it, expect } from "vitest";

import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  verifyCodeSchema,
  resetPasswordSchema,
  editUserSchema,
  changePasswordSchema,
  cities,
} from "../validationSchema";

describe("signUpSchema", () => {
  const validData = {
    f_name: "علی",
    l_name: "رضایی",
    phone_number: "09121234567",
    job: "برنامه نویس",
    email_address: "alirezaei@test.com",
    city: "تهران",
    username: "ali_rezaei",
    password: "Pass1234",
    secondPassword: "Pass1234",
  };

  it("validates correct data", async () => {
    await expect(signUpSchema.validate(validData)).resolves.toBeDefined();
  });

  it("rejects missing f_name", async () => {
    const data = { ...validData, f_name: "" };
    await expect(signUpSchema.validate(data)).rejects.toThrow();
  });

  it("rejects f_name with non-Persian characters", async () => {
    const data = { ...validData, f_name: "Ali123" };
    await expect(signUpSchema.validate(data)).rejects.toThrow();
  });

  it("rejects short f_name", async () => {
    const data = { ...validData, f_name: "عل" };
    await expect(signUpSchema.validate(data)).rejects.toThrow();
  });

  it("rejects invalid phone number format", async () => {
    const data = { ...validData, phone_number: "1234567890" };
    await expect(signUpSchema.validate(data)).rejects.toThrow();
  });

  it("rejects phone number not starting with 09", async () => {
    const data = { ...validData, phone_number: "0912123456" };
    await expect(signUpSchema.validate(data)).rejects.toThrow();
  });

  it("rejects invalid email format", async () => {
    const data = { ...validData, email_address: "not-an-email" };
    await expect(signUpSchema.validate(data)).rejects.toThrow();
  });

  it("rejects invalid city", async () => {
    const data = { ...validData, city: "Invalid City" };
    await expect(signUpSchema.validate(data)).rejects.toThrow();
  });

  it("accepts all valid cities", async () => {
    for (const city of cities) {
      const data = { ...validData, city };
      await expect(signUpSchema.validate(data)).resolves.toBeDefined();
    }
  });

  it("rejects username with spaces", async () => {
    const data = { ...validData, username: "ali rezaei" };
    await expect(signUpSchema.validate(data)).rejects.toThrow();
  });

  it("rejects short password", async () => {
    const data = { ...validData, password: "Pass1", secondPassword: "Pass1" };
    await expect(signUpSchema.validate(data)).rejects.toThrow();
  });

  it("rejects mismatched passwords", async () => {
    const data = { ...validData, password: "Pass1234", secondPassword: "Pass5678" };
    await expect(signUpSchema.validate(data)).rejects.toThrow();
  });
});

describe("signInSchema", () => {
  const validData = {
    username: "ali_rezaei",
    password: "Pass1234",
  };

  it("validates correct data", async () => {
    await expect(signInSchema.validate(validData)).resolves.toBeDefined();
  });

  it("rejects missing username", async () => {
    await expect(signInSchema.validate({ username: "", password: "Pass1234" })).rejects.toThrow();
  });

  it("rejects short password", async () => {
    await expect(signInSchema.validate({ username: "ali", password: "Pass1" })).rejects.toThrow();
  });

  it("rejects long password", async () => {
    const longPass = "A".repeat(51);
    await expect(signInSchema.validate({ username: "ali", password: longPass })).rejects.toThrow();
  });
});

describe("forgotPasswordSchema", () => {
  it("validates correct email", async () => {
    await expect(
      forgotPasswordSchema.validate({ email: "testuser@example.com" })
    ).resolves.toBeDefined();
  });

  it("rejects invalid email", async () => {
    await expect(forgotPasswordSchema.validate({ email: "not-email" })).rejects.toThrow();
  });

  it("rejects empty email", async () => {
    await expect(forgotPasswordSchema.validate({ email: "" })).rejects.toThrow();
  });
});

describe("verifyCodeSchema", () => {
  it("validates 6-digit code", async () => {
    await expect(verifyCodeSchema.validate({ code: "123456" })).resolves.toBeDefined();
  });

  it("rejects non-numeric code", async () => {
    await expect(verifyCodeSchema.validate({ code: "abcdef" })).rejects.toThrow();
  });

  it("rejects short code", async () => {
    await expect(verifyCodeSchema.validate({ code: "12345" })).rejects.toThrow();
  });

  it("rejects long code", async () => {
    await expect(verifyCodeSchema.validate({ code: "1234567" })).rejects.toThrow();
  });
});

describe("resetPasswordSchema", () => {
  const validData = {
    password: "NewPass123",
    confirmPassword: "NewPass123",
  };

  it("validates matching passwords", async () => {
    await expect(resetPasswordSchema.validate(validData)).resolves.toBeDefined();
  });

  it("rejects mismatched passwords", async () => {
    const data = { password: "NewPass123", confirmPassword: "WrongPass" };
    await expect(resetPasswordSchema.validate(data)).rejects.toThrow();
  });

  it("rejects short password", async () => {
    const data = { password: "Pass1", confirmPassword: "Pass1" };
    await expect(resetPasswordSchema.validate(data)).rejects.toThrow();
  });
});

describe("editUserSchema", () => {
  const validData = {
    f_name: "علی",
    l_name: "رضایی",
    phone_number: "09121234567",
    job: "برنامه نویس",
    email_address: "alirezaei@test.com",
    city: "تهران",
  };

  it("validates correct data", async () => {
    await expect(editUserSchema.validate(validData)).resolves.toBeDefined();
  });

  it("rejects missing required fields", async () => {
    const data = { f_name: "علی" };
    await expect(editUserSchema.validate(data)).rejects.toThrow();
  });

  it("rejects invalid city", async () => {
    const data = { ...validData, city: "Invalid" };
    await expect(editUserSchema.validate(data)).rejects.toThrow();
  });
});

describe("changePasswordSchema", () => {
  const validData = {
    currentPassword: "OldPass123",
    newPassword: "NewPass456",
  };

  it("validates correct data", async () => {
    await expect(changePasswordSchema.validate(validData)).resolves.toBeDefined();
  });

  it("rejects missing currentPassword", async () => {
    await expect(
      changePasswordSchema.validate({ currentPassword: "", newPassword: "NewPass456" })
    ).rejects.toThrow();
  });

  it("rejects short new password", async () => {
    await expect(
      changePasswordSchema.validate({ currentPassword: "OldPass123", newPassword: "Pass1" })
    ).rejects.toThrow();
  });
});

describe("cities", () => {
  it("contains all 31 Iranian provinces", () => {
    expect(cities.length).toBe(31);
  });

  it("includes Tehran", () => {
    expect(cities).toContain("تهران");
  });

  it("includes Isfahan", () => {
    expect(cities).toContain("اصفهان");
  });
});
