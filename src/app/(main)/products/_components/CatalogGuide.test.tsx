import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CatalogGuide from "./CatalogGuide";

describe("CatalogGuide", () => {
  it("keeps the complete editorial guide available in a closed native disclosure", () => {
    const html = renderToStaticMarkup(
      <CatalogGuide title="دوربین مداربسته حرارتی">
        <article>
          <h2>راهنمای انتخاب</h2>
          <p>نکات کامل برای انتخاب مدل و نصب دوربین.</p>
        </article>
      </CatalogGuide>
    );

    expect(html).toContain("<details");
    expect(html).not.toContain("<details open");
    expect(html).toContain("راهنمای انتخاب دوربین مداربسته حرارتی");
    expect(html).toContain("نکات کامل برای انتخاب مدل و نصب دوربین.");
  });
});
