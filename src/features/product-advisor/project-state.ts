import type { AdvisorProductSnapshot } from "./types";

export interface AdvisorBoardItem {
  product: AdvisorProductSnapshot;
  quantity: number;
}

export interface AdvisorProject {
  version: 1;
  board: AdvisorBoardItem[];
  preferredProductId: number | null;
  note: string;
}

export type AdvisorProjectAction = { type: "add"; product: AdvisorProductSnapshot };

export const emptyAdvisorProject: AdvisorProject = {
  version: 1,
  board: [],
  preferredProductId: null,
  note: "",
};

export function addToBoard(product: AdvisorProductSnapshot): AdvisorProjectAction {
  return { type: "add", product };
}

export function reduceProject(
  project: AdvisorProject,
  action: AdvisorProjectAction
): AdvisorProject {
  if (
    action.type !== "add" ||
    project.board.some((item) => item.product.productId === action.product.productId)
  ) {
    return project;
  }

  const categoryItemCount = project.board.filter(
    (item) => item.product.categorySlug === action.product.categorySlug
  ).length;
  if (categoryItemCount >= 4) return project;

  return { ...project, board: [...project.board, { product: action.product, quantity: 1 }] };
}

export function selectBoardGroups(project: AdvisorProject) {
  return Object.values(
    project.board.reduce<Record<string, AdvisorBoardItem[]>>((groups, item) => {
      const items = groups[item.product.categorySlug] ?? [];
      items.push(item);
      groups[item.product.categorySlug] = items;
      return groups;
    }, {})
  );
}

export function selectComparableItems(project: AdvisorProject, categorySlug: string) {
  return project.board.filter((item) => item.product.categorySlug === categorySlug);
}
