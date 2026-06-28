#!/usr/bin/env node
// Regenerates docs/evidence/PRD-029/2026-04-25/phase-a/design-review/rtl-logical-css-grep.json
// with a precise regex that targets only POSITIONAL CSS properties (left/right declarations
// and their JS-style camelCase counterparts) and excludes false-positives from
// gradient direction keywords, background/object-position values, and animation timing.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, relative, dirname } from "node:path";

const ROOT = process.cwd();
const TARGET_ROOT = join(ROOT, "src", "pages", "BrandTemplate");
const OUT = join(
  ROOT,
  "docs",
  "evidence",
  "PRD-029",
  "2026-04-25",
  "phase-a",
  "design-review",
  "rtl-logical-css-grep.json",
);

// Match property declarations only:
//   - CSS:  `left:`, `right:`, `margin-left:`, `padding-right:`, `border-left-width:`, `inset-inline-*` (logical, allowed)
//   - JSX:  `marginLeft:`, `paddingRight:`, `borderLeftWidth:` (object syntax)
// Anchor on a leading delimiter (start of line / `{` / `;` / `,`) so substrings
// inside `gradient(... at top right ...)` or `object-position: left bottom` do not match.
const CSS_PROP_PATTERN =
  /(?:^|[\s;{,])\s*(left|right|margin-(?:left|right)|padding-(?:left|right)|border-(?:left|right)(?:-(?:width|color|style))?)\s*:/i;
const JSX_PROP_PATTERN =
  /\b(marginLeft|marginRight|paddingLeft|paddingRight|borderLeft(?:Width|Color|Style)?|borderRight(?:Width|Color|Style)?)\s*:/;
const FILE_EXT = /\.(css|scss|jsx?|tsx?)$/i;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && FILE_EXT.test(entry.name)) yield full;
  }
}

const matches = [];
for await (const file of walk(TARGET_ROOT)) {
  const text = await readFile(file, "utf8");
  const lines = text.split(/\r?\n/);
  const isStyle = /\.(css|scss)$/i.test(file);
  const pattern = isStyle ? CSS_PROP_PATTERN : JSX_PROP_PATTERN;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (pattern.test(line)) {
      matches.push({
        file: relative(ROOT, file),
        line: i + 1,
        text: line.trim(),
      });
    }
  }
}

const out = {
  generatedAt: new Date().toISOString(),
  generator: "scripts/regen-rtl-logical-grep.mjs",
  cssPattern: CSS_PROP_PATTERN.source,
  jsxPattern: JSX_PROP_PATTERN.source,
  scope: "Positional left/right declarations only; excludes gradient keywords, "
    + "object/background-position values, and animation directions.",
  root: relative(ROOT, TARGET_ROOT),
  matchCount: matches.length,
  matches,
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(out, null, 2) + "\n", "utf8");
console.log(`wrote ${relative(ROOT, OUT)} (${matches.length} matches)`);
