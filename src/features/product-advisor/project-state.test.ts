import { describe, expect, it } from "vitest";

import {
  addToBoard,
  emptyAdvisorProject,
  reduceProject,
  selectBoardGroups,
  selectComparableItems,
} from "./project-state";
import type { AdvisorProductSnapshot } from "./types";

const reolinkCamera: AdvisorProductSnapshot = {
  productId: 1,
  categorySlug: "reolink-cctv-camera",
  subcategorySlug: null,
  name: "رئولینک",
  model: "RLC",
  sourceText: "رئولینک",
  imageUrl: null,
  detailHref: "/products/reolink-cctv-camera",
  specs: [],
};
const blackmagicCamera: AdvisorProductSnapshot = {
  ...reolinkCamera,
  productId: 2,
  categorySlug: "blackmagic",
  name: "بلک‌مجیک",
};

describe("advisor project state", () => {
  it("groups cross-category products while comparing only one category", () => {
    const state = reduceProject(emptyAdvisorProject, addToBoard(reolinkCamera));
    const next = reduceProject(state, addToBoard(blackmagicCamera));

    expect(selectComparableItems(next, "reolink-cctv-camera")).toEqual([
      expect.objectContaining({ product: reolinkCamera }),
    ]);
    expect(selectBoardGroups(next)).toHaveLength(2);
  });
});
