import { vi } from "vitest";

export interface ApiTestContext {
  mockCookieStore: Map<string, string>;
  mockJwtVerify: ReturnType<typeof vi.fn>;
  mockPrisma: Record<string, any>;
  setupAuth: (role?: string, overrides?: Record<string, any>) => void;
  resetAll: () => void;
}

/**
 * Creates a reusable test context for Next.js API route tests.
 * Handles mocking next/headers (cookies), jose (jwtVerify), and @/lib/prisma.
 */
export function createApiTestContext(
  prismaModels: Record<string, any> = {}
): ApiTestContext {
  const mockCookieStore = new Map<string, string>();
  const mockJwtVerify = vi.fn();
  const mockPrisma = prismaModels;

  return {
    mockCookieStore,
    mockJwtVerify,
    mockPrisma,

    setupAuth(role = "Admin", overrides: Record<string, any> = {}) {
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
        jwtVerify: (...args: any[]) => mockJwtVerify(...args),
      };
    },

    mockPrismaModule() {
      return {
        prisma: mockPrisma,
      };
    },
  };
}

/**
 * Creates a Request object for API route testing.
 */
export function makeApiRequest(
  method: string,
  url: string,
  body?: any,
  headers?: Record<string, string>
): Request {
  return new Request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}
