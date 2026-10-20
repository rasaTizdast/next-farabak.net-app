import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import CategoryFields from "../newItemModalComponents/CategoryFields";

describe("CategoryFields", () => {
  it("shows a validation message while keeping the user's invalid input visible", () => {
    const setName = vi.fn();
    render(
      <CategoryFields
        name=""
        slug=""
        available={true}
        setName={setName}
        setSlug={vi.fn()}
        setAvailable={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("نام دسته‌بندی"), { target: { value: "Name@" } });

    expect(setName).toHaveBeenCalledWith("Name@");
    expect(
      screen.getByText("نام باید حروف فارسی یا انگلیسی و حداکثر ۱۰۰۰ کاراکتر باشد.")
    ).toBeInTheDocument();
  });

  it("normalizes a valid slug before updating the draft", () => {
    const setSlug = vi.fn();
    render(
      <CategoryFields
        name=""
        slug=""
        available={true}
        setName={vi.fn()}
        setSlug={setSlug}
        setAvailable={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText("شناسه"), { target: { value: "New Category" } });

    expect(setSlug).toHaveBeenCalledWith("new-category");
  });
});
