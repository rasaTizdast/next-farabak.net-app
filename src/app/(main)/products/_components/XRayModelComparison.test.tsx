import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import XRayModelComparison from "./XRayModelComparison";

describe("XRayModelComparison", () => {
  it("renders a source-linked comparison for the two listed CTX models", () => {
    const html = renderToStaticMarkup(<XRayModelComparison />);
    const document = new DOMParser().parseFromString(html, "text/html");

    expect(document.querySelector("h2")?.textContent).toContain("مقایسه");
    expect(document.querySelectorAll("tbody tr")).toHaveLength(4);
    expect(document.body.textContent).toContain("CTX 5800");
    expect(document.body.textContent).toContain("CTX 9800 DSi");
    expect(document.body.textContent).toContain("۴۰۰ تا ۴۵۰");
    expect(document.body.textContent).toContain("۱٬۸۰۰");
    expect(document.querySelector('a[href="https://www.smithsdetection.com/products/ctx-5800/"]'));
    expect(
      document.querySelector('a[href="https://www.smithsdetection.com/products/ctx-9800-dsi/"]')
    );
    expect(document.body.textContent).toContain("ظرفیت واقعی به پیکربندی");
  });
});
