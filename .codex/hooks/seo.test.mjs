import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const cwd = fileURLToPath(new URL("../../", import.meta.url));
const config = JSON.parse(readFileSync(new URL("../hooks.json", import.meta.url), "utf8"));
const script = fileURLToPath(new URL("seo.mjs", import.meta.url));

function dispatch(hook_event_name, payload) {
  const result = spawnSync(process.execPath, [script], {
    encoding: "utf8",
    input: JSON.stringify({ cwd, hook_event_name, ...payload }),
  });

  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim() ? JSON.parse(result.stdout) : {};
}

test("registers both SEO hooks with native Codex events", () => {
  assert.deepEqual(Object.keys(config.hooks).sort(), ["PostToolUse", "UserPromptSubmit"]);
  assert.equal(config.hooks.PostToolUse[0].matcher, "^apply_patch$");
});

test("routes English and Persian search visibility prompts", () => {
  for (const prompt of [
    "Why do our rivals outrank us on Google?",
    "چرا صفحات فرابک در گوگل نمایش داده نمی‌شوند؟",
    "$farabak-seo",
    "Compare our page rankings with Maxa",
  ]) {
    const output = dispatch("UserPromptSubmit", { prompt });
    assert.equal(output.hookSpecificOutput.hookEventName, "UserPromptSubmit");
    assert.match(output.hookSpecificOutput.additionalContext, /farabak-seo/);
  }
});

test("an ordinary coding prompt receives no SEO instructions", () => {
  assert.deepEqual(
    dispatch("UserPromptSubmit", { prompt: "Fix the array indexing in the admin dashboard" }),
    {}
  );
});

test("a patch to a search-facing file receives targeted verification instructions", () => {
  const output = dispatch("PostToolUse", {
    tool_name: "apply_patch",
    tool_input: { command: "*** Begin Patch\n*** Update File: src/app/robots.ts\n*** End Patch" },
  });

  assert.equal(output.hookSpecificOutput.hookEventName, "PostToolUse");
  assert.match(output.hookSpecificOutput.additionalContext, /robots/);
  assert.equal(output.decision, undefined);
});

test("unrelated and outside-repository paths do not trigger release checks", () => {
  const output = dispatch("PostToolUse", {
    tool_name: "apply_patch",
    tool_input: {
      command:
        "*** Begin Patch\n*** Update File: src/app/api/users/route.ts\n*** Update File: ../outside/src/app/robots.ts\n*** End Patch",
    },
  });

  assert.deepEqual(output, {});
});
