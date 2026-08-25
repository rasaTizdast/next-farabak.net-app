import { NextRequest } from "next/server";
import { vi } from "vitest";

export interface ApiTestContext {
  mockCookieStore: Map<string, string>;
  mockJwtVerify: ReturnType<typeof vi.fn>;
  mockPrisma: Record<string, unknown>;
  setupAuth: (role?: string, overrides?: Record<string, unknown>) => void;
  resetAll: () => void;
  mockNextHeaders: () => {
    cookies: ReturnType<typeof vi.fn>;
  };
  mockJose: () => {
    jwtVerify: (...args: unknown[]) => ReturnType<typeof vi.fn>;
  };
  mockPrismaModule: () => {
    prisma: Record<string, unknown>;
  };
}

/**
 * Creates a reusable test context for Next.js API route tests.
 * Handles mocking next/headers (cookies), jose (jwtVerify), and @/lib/prisma.
 */
export function createApiTestContext(prismaModels: Record<string, unknown> = {}): ApiTestContext {
  const mockCookieStore = new Map<string, string>();
  const mockJwtVerify = vi.fn();
  const mockPrisma = prismaModels;

  return {
    mockCookieStore,
    mockJwtVerify,
    mockPrisma,

    setupAuth(role = "Admin", overrides: Record<string, unknown> = {}) {
      mockCookieStore.set("accessToken", "valid-token");
      mockJwtVerify.mockResolvedValue({
        payload: {
          userId: 1,
          username: "testuser",
          role,
          ...overrides,
        },
      });
    },

    resetAll() {
      vi.clearAllMocks();
      mockCookieStore.clear();
    },

    mockNextHeaders() {
      return {
        cookies: vi.fn(async () => ({
          get: (name: string) => {
            const val = mockCookieStore.get(name);
            return val ? { value: val } : undefined;
          },
        })),
      };
    },

    mockJose() {
      return {
        jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
      };
    },

    mockPrismaModule() {
      return {
        prisma: mockPrisma as Record<string, unknown>,
      };
    },
  };
}

/**
 * Creates a NextRequest object for API route testing.
 */
export function makeApiRequest(
  method: string,
  url: string,
  body?: unknown,
  headers?: Record<string, string>
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
