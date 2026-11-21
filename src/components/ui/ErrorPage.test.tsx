import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ErrorPage } from "./ErrorPage";

describe("ErrorPage", () => {
  it("shows the original 404 illustration with an accessible heading", () => {
    const html = renderToStaticMarkup(
      <ErrorPage statusCode={404} title="صفحه یافت نشد" message="صفحه مورد نظر وجود ندارد" />
    );

    expect(html).toContain("%2F404.png");
    expect(html).toContain("<h1");
    expect(html).toContain("صفحه یافت نشد");
  });

  it("can expose its not-found content as the page main landmark", () => {
    const { container } = render(
      <ErrorPage asMain statusCode={404} title="صفحه یافت نشد" message="صفحه مورد نظر وجود ندارد" />
    );

    expect(container.querySelectorAll("main")).toHaveLength(1);
    expect(container.querySelector("main h1")).toHaveTextContent("صفحه یافت نشد");
  });
});
