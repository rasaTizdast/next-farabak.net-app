import { describe, expect, it } from "vitest";

import { negotiate, parseAccept, prefersMarkdown } from "../contentNegotiation";

describe("parseAccept", () => {
  it("returns an empty list for missing headers", () => {
    expect(parseAccept(null)).toEqual([]);
    expect(parseAccept(undefined)).toEqual([]);
    expect(parseAccept("")).toEqual([]);
  });

  it("parses types, subtypes and q-values", () => {
    const entries = parseAccept("text/markdown;q=0.9, text/html;q=0.8, */*;q=0.1");
    expect(entries).toHaveLength(3);
    expect(entries[0]).toMatchObject({ type: "text", subtype: "markdown", q: 0.9 });
    expect(entries[1]).toMatchObject({ type: "text", subtype: "html", q: 0.8 });
    expect(entries[2]).toMatchObject({ type: "*", subtype: "*", q: 0.1 });
  });

  it("defaults q to 1 and clamps invalid values", () => {
    const [entry] = parseAccept("text/html");
    expect(entry.q).toBe(1);
    const [bad] = parseAccept("text/html;q=abc");
    expect(bad.q).toBe(1);
  });
});

describe("negotiate", () => {
  it("serves markdown when the client prefers text/markdown", () => {
    expect(negotiate("text/markdown")).toBe("text/markdown");
    expect(negotiate("text/markdown, text/html;q=0.8")).toBe("text/markdown");
  });

  it("serves html for browser headers", () => {
    expect(negotiate("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")).toBe(
      "text/html"
    );
    expect(negotiate("*/*")).toBe("text/html");
    expect(negotiate(null)).toBe("text/html");
  });

  it("breaks q-value ties by specificity", () => {
    // Equal q: exact text/html beats wildcard */*
    expect(negotiate("text/html;q=0.5, */*;q=0.5")).toBe("text/html");
    expect(negotiate("text/markdown;q=0.5, */*;q=0.5")).toBe("text/markdown");
  });

  it.each([
    ["text/markdown;q=0, */*", "text/html"],
    ["text/html;q=0, text/*", "text/markdown"],
    ["text/*;q=0, */*", null],
    ["text/markdown;q=0.2, text/*;q=0.8", "text/html"],
    ["text/html;q=0, text/markdown;q=0, */*", null],
  ])("uses the most specific quality for %s", (accept, expected) => {
    expect(negotiate(accept)).toBe(expected);
  });

  it("defaults to the first representation available for this resource", () => {
    expect(negotiate(undefined, ["text/markdown"])).toBe("text/markdown");
    expect(negotiate(undefined, [])).toBeNull();
  });

  it("returns null (406) when only unproducible types are acceptable", () => {
    expect(negotiate("image/png")).toBeNull();
    expect(negotiate("audio/*, video/*")).toBeNull();
    expect(negotiate("image/png;q=0, text/html;q=0")).toBeNull();
  });

  it("does not substring-match on markdown", () => {
    // text/plain is NOT a request for markdown
    expect(prefersMarkdown("text/plain")).toBe(false);
  });

  it("matches representation parameters without treating unsupported variants as available", () => {
    expect(negotiate("text/markdown;variant=nonexistent,text/html;q=0.8")).toBe("text/html");
    expect(negotiate("text/markdown;charset=utf-8,text/html;q=0.8")).toBe("text/markdown");
    expect(negotiate("text/html;profile=foo;q=0,*/*")).toBe("text/html");
  });
});

describe("prefersMarkdown", () => {
  it("is true only when markdown wins negotiation", () => {
    expect(prefersMarkdown("text/markdown")).toBe(true);
    expect(prefersMarkdown("text/markdown;q=0.9, text/html;q=0.8")).toBe(true);
    expect(prefersMarkdown("text/markdown;q=0.2, text/html;q=0.8")).toBe(false);
    expect(prefersMarkdown("application/json")).toBe(false);
  });
});
