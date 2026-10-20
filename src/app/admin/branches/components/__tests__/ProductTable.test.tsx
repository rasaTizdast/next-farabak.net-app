import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import ProductTable from "../ProductTable";

vi.mock("antd", () => ({
  Table: ({ columns, dataSource }: any) => columns[1].render(null, dataSource[0]),
  InputNumber: ({ value, min, onChange, onBlur }: any) => (
    <input
      aria-label="quantity"
      type="number"
      value={value}
      min={min}
      onChange={(event) => onChange(Number(event.target.value))}
      onBlur={onBlur}
    />
  ),
  Button: "button",
  Popconfirm: ({ children }: any) => children,
  Empty: () => null,
  Spin: () => null,
}));

afterEach(() => vi.useRealTimers());

describe("branch stock editing", () => {
  const product = { ProductId: 4, Type: "Test", quantity: 5 };
  it("sends an edited quantity only once when blur follows the debounce", () => {
    vi.useFakeTimers();
    const onUpdateQuantity = vi.fn();
    render(
      <ProductTable
        products={[product]}
        loading={false}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={vi.fn()}
      />
    );
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "6" } });
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.blur(screen.getByRole("spinbutton"));
    expect(onUpdateQuantity).toHaveBeenCalledTimes(1);
    expect(onUpdateQuantity).toHaveBeenCalledWith(4, 6);
  });

  it("allows reducing stock to zero, matching the update API", () => {
    const onUpdateQuantity = vi.fn();
    render(
      <ProductTable
        products={[product]}
        loading={false}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={vi.fn()}
      />
    );
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "0" } });
    fireEvent.blur(screen.getByRole("spinbutton"));
    expect(onUpdateQuantity).toHaveBeenCalledWith(4, 0);
  });

  it("does not send fractional stock quantities rejected by the API", () => {
    vi.useFakeTimers();
    const onUpdateQuantity = vi.fn();
    render(
      <ProductTable
        products={[product]}
        loading={false}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={vi.fn()}
      />
    );
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "6.5" } });
    act(() => vi.advanceTimersByTime(2000));
    fireEvent.blur(screen.getByRole("spinbutton"));
    expect(onUpdateQuantity).not.toHaveBeenCalled();
  });
});
