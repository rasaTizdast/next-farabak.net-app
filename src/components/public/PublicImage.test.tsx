import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => <img {...props} alt={props.alt ?? ""} />,
}));

import { PublicImage } from "./PublicImage";

describe("PublicImage", () => {
  it("renders an accessible fallback when the source is missing", () => {
    render(<PublicImage src={null} alt="تصویر عضو" fallbackLabel="تصویر عضو موجود نیست" />);

    expect(screen.getByRole("img", { name: "تصویر عضو موجود نیست" })).toBeVisible();
  });

  it("switches to the fallback when media loading fails", () => {
    render(<PublicImage src="/member.jpg" alt="تصویر عضو" fallbackLabel="تصویر عضو موجود نیست" />);

    fireEvent.error(screen.getByRole("img", { name: "تصویر عضو" }));

    expect(screen.getByRole("img", { name: "تصویر عضو موجود نیست" })).toBeVisible();
  });
});
