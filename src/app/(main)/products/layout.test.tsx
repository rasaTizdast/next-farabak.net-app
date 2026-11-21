import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProductsLayout from "./layout";

describe("products layout landmarks", () => {
  it("keeps the shared main as the only main landmark", () => {
    const { container } = render(
      <main id="main-content">
        <ProductsLayout>
          <h1>محصولات</h1>
        </ProductsLayout>
      </main>
    );

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(container.querySelector("#main-content h1")).toHaveTextContent("محصولات");
  });
});
