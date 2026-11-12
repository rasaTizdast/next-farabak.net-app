import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ActivityEditor from "./ActivityEditor";

const { saveActivities } = vi.hoisted(() => ({ saveActivities: vi.fn() }));

vi.mock("react-hot-toast", () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("@/hooks/useApiFetch", () => ({
  useApiFetch: () => ({
    data: [
      {
        id: 8,
        title: "فعالیت آزمایشی",
        Details_activity: [{ id: 12, activityID: 8, description: "شرح آزمایشی" }],
      },
    ],
  }),
}));
vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({ mutate: saveActivities }),
}));
vi.mock("@/hooks/useModalA11y", () => ({
  useModalA11y: () => ({ current: null }),
}));

describe("ActivityEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveActivities.mockResolvedValue({ message: "Updated successfully" });
  });

  it("sends detail records under the API's Details_activity field", async () => {
    render(<ActivityEditor onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "ثبت تغییرات" }));

    await waitFor(() =>
      expect(saveActivities).toHaveBeenCalledWith("/api/activities", [
        {
          id: 8,
          title: "فعالیت آزمایشی",
          Details_activity: [{ id: 12, description: "شرح آزمایشی" }],
        },
      ])
    );
  });
});
