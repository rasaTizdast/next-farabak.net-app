import type { CommentTarget } from "./types";

export function commentTag(target: CommentTarget): string {
  return `comments:${target.type}:${target.id}`;
}
