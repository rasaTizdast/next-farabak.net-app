import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ReportWorkspace from "./ReportWorkspace";

describe("product finder report hydration state", () => {
  it("does not render the empty state before local storage has been read", () => {
    const html = renderToStaticMarkup(<ReportWorkspace />);

    expect(html).toContain('role="status"');
    expect(html).toMatch(/<h1\b[^>]*>گزارش انتخاب فرابک<\/h1>/);
    expect(html).not.toContain("گزارشی برای چاپ ندارید");
  });
});
