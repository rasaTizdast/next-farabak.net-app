import { describe, it, expect, vi, beforeEach } from "vitest";
import { signInvoiceData, verifyInvoiceData, type InvoiceData } from "../invoiceJwt";

vi.mock("jose", () => {
  return {
    SignJWT: vi.fn().mockImplementation(function () {
      const setProtectedHeaderMock = vi.fn();
      const setExpirationTimeMock = vi.fn();
      const signMock = vi.fn().mockResolvedValue("mock-jwt-token");
      const chain = {
        setProtectedHeader: setProtectedHeaderMock,
        setExpirationTime: setExpirationTimeMock,
        sign: signMock,
      };
      setProtectedHeaderMock.mockReturnValue(chain);
      setExpirationTimeMock.mockReturnValue(chain);
      return chain;
    }),
    jwtVerify: vi.fn(),
  };
});

import { SignJWT, jwtVerify } from "jose";

const mockJwtVerify = vi.mocked(jwtVerify);

describe("signInvoiceData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a JWT token string", async () => {
    const data: InvoiceData = {
      products: [{ ProductId: 1, ProductName: "Test", Quantity: 2 }],
      TotalAmount: 100000,
      timestamp: Date.now(),
    };

    const token = await signInvoiceData(data);
    expect(typeof token).toBe("string");
    expect(token).toBe("mock-jwt-token");
  });

  it("creates SignJWT with HS256 algorithm", async () => {
    const data: InvoiceData = {
      products: [],
      TotalAmount: 0,
      timestamp: Date.now(),
    };

    await signInvoiceData(data);
    expect(SignJWT).toHaveBeenCalled();
  });
});

describe("verifyInvoiceData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns decoded invoice data on valid token", async () => {
    const mockData: InvoiceData = {
      products: [{ ProductId: 1, ProductName: "Test", Quantity: 2 }],
      TotalAmount: 100000,
      timestamp: Date.now(),
    };

    mockJwtVerify.mockResolvedValue({ payload: mockData } as never);

    const result = await verifyInvoiceData("valid-token");
    expect(result).toEqual(mockData);
  });

  it("returns null on invalid token", async () => {
    mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

    const result = await verifyInvoiceData("invalid-token");
    expect(result).toBeNull();
  });

  it("returns null on expired token", async () => {
    mockJwtVerify.mockRejectedValue(new Error("JWT expired"));

    const result = await verifyInvoiceData("expired-token");
    expect(result).toBeNull();
  });

  it("calls jwtVerify with the token", async () => {
    mockJwtVerify.mockResolvedValue({ payload: {} } as never);

    await verifyInvoiceData("test-token");
    expect(mockJwtVerify).toHaveBeenCalledTimes(1);
  });
});
