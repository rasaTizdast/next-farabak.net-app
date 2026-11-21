import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import BoardWorkspace from "./BoardWorkspace";

describe("product finder board hydration state", () => {
  it("does not render the empty state before local storage has been read", () => {
    const html = renderToStaticMarkup(<BoardWorkspace />);

    expect(html).toContain('role="status"');
    expect(html).toMatch(/<h1\b[^>]*>میز تصمیم محصولات<\/h1>/);
    expect(html).not.toContain("میز تصمیم خالی است");
  });
});
