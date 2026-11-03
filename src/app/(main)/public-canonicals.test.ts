import { describe, expect, it } from "vitest";

import { metadata as activityMetadata } from "./about-us/activity/page";
import { metadata as membersMetadata } from "./about-us/members/page";
import { metadata as aboutMetadata } from "./about-us/page";
import { metadata as projectsMetadata } from "./about-us/projects/page";
import { metadata as contactMetadata } from "./contact-us/page";
import { metadata as downloadMetadata } from "./support/download-center/page";
import { metadata as faqMetadata } from "./support/faq/page";
import { metadata as supportMetadata } from "./support/page";
import { metadata as warrantyMetadata } from "./support/warranty-tracking/page";

describe("crawl-listed public page canonicals", () => {
  it.each([
    ["About", aboutMetadata, "/about-us"],
    ["Members", membersMetadata, "/about-us/members"],
    ["Projects", projectsMetadata, "/about-us/projects"],
    ["Activity", activityMetadata, "/about-us/activity"],
    ["Contact", contactMetadata, "/contact-us"],
    ["Support", supportMetadata, "/support"],
    ["Download center", downloadMetadata, "/support/download-center"],
    ["Warranty tracking", warrantyMetadata, "/support/warranty-tracking"],
    ["FAQ", faqMetadata, "/support/faq"],
  ])("uses the self canonical for %s", (_name, metadata, canonical) => {
    expect(metadata.alternates?.canonical).toBe(canonical);
  });
});
