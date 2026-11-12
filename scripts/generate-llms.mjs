import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { LLMS_CONTENT } from "./llms-content.mjs";

const outputPath = fileURLToPath(new URL("../public/llms.txt", import.meta.url));

writeFileSync(outputPath, LLMS_CONTENT, "utf8");

const lineCount = LLMS_CONTENT.split("\n").length;
console.log(`Wrote public/llms.txt (${lineCount} lines)`);
