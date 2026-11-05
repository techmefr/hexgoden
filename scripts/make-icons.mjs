import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR ?? "playwright");
const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = readFileSync(join(root, "favicon.svg"), "utf8");
const browser = await chromium.launch();
for (const size of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<body style="margin:0;background:#0e1026">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body>`);
  await page.screenshot({ path: join(root, `icon-${size}.png`) });
}
await browser.close();
