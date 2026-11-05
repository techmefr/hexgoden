import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "design", "mockups");
const tokens = Object.fromEntries([...readFileSync(join(root, "tokens.css"), "utf8").matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map(([, k, v]) => [k, v]));

const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(tokens[a]), lum(tokens[b])].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const PAIRS = [
  ["text", "space", 4.5, "Body text on page"],
  ["text", "surface", 4.5, "Text on panels"],
  ["text", "surface-raised", 4.5, "Text on controls"],
  ["text-muted", "space", 4.5, "Secondary text on page"],
  ["text-muted", "surface", 4.5, "Secondary text on panels"],
  ["text-muted", "surface-raised", 4.5, "Secondary text on controls"],
  ["accent-ink", "accent", 4.5, "Text on selected power"],
  ["life-ink", "surface-raised", 4.5, "Rising chip text"],
  ["warn-ink", "warn-surface", 4.5, "Warning chip text"],
  ["text-disabled", "surface", 4.5, "Disabled and locked text"],
  ["border", "space", 3, "Control border on page"],
  ["border", "surface", 3, "Control border on panels"],
  ["border", "surface-raised", 3, "Chip border on cards"],
  ["accent", "surface", 3, "Selected border on panels"],
  ["accent", "space", 3, "Selected border on page"],
  ["focus", "space", 3, "Focus ring on page"],
  ["focus", "surface", 3, "Focus ring on panels"],
  ["focus", "surface-raised", 3, "Focus ring on controls"],
  ["warn-border", "warn-surface", 3, "Warning chip border"],
  ["accent", "surface-sunken", 3, "Sparkline on cards"],
];

let failed = 0;
const rows = PAIRS.map(([fg, bg, min, use]) => {
  const r = ratio(fg, bg);
  const ok = r >= min;
  if (!ok) failed++;
  return `| ${use} | ${fg} on ${bg} | ${tokens[fg]} on ${tokens[bg]} | ${r.toFixed(2)}:1 | ${min}:1 | ${ok ? "pass" : "FAIL"} |`;
});
console.log("| Use | Pair | Values | Ratio | Needs | Result |\n| --- | --- | --- | --- | --- | --- |\n" + rows.join("\n"));

const literal = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\b(?:fill|stroke|color|background(?:-color)?)\s*[:=]\s*"?(?:white|black|red|blue|green|gray|grey|yellow|orange|purple|pink)\b/;
for (const f of readdirSync(root).filter((n) => /^(0\d-.*|index)\.html$|^shared\.css$/.test(n))) {
  readFileSync(join(root, f), "utf8").split("\n").forEach((line, i) => {
    if (literal.test(line)) { failed++; console.log(`literal colour in ${f}:${i + 1}`); }
  });
}
console.log(failed ? `\n${failed} problem(s)` : "\nAll contrast pairs pass and no literal colours in screens");
process.exit(failed ? 1 : 0);
