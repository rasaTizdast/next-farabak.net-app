import { vi } from "vitest";

import "@testing-library/jest-dom";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
