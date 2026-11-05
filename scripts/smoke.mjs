import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_DIR ?? "playwright");
const url = process.env.GAME_URL ?? "http://localhost:4173/";
const out = process.env.SHOTS ?? "/tmp/hexgoden-shots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
let failed = 0;
const check = (ok, label) => { console.log(`${ok ? "ok  " : "FAIL"} ${label}`); if (!ok) failed++; };

for (const [name, w, h] of [["mobile", 390, 844], ["desktop", 1440, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(url);
  await page.screenshot({ path: `${out}/start-${name}.png` });
  await page.getByRole("button", { name: "Begin" }).click();
  await page.waitForSelector("canvas");
  await page.waitForTimeout(2500);
  check((await page.locator("canvas").count()) === 1, `${name}: canvas rendered`);
  const box = await page.locator("canvas").boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await page.waitForTimeout(800);
  const tile = (await page.locator("text=Altitude >> visible=true").count()) > 0;
  check(tile, `${name}: tile inspector shows after tapping the planet`);
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `${out}/game-${name}.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(overflow <= 0, `${name}: no horizontal overflow`);
  check(errors.length === 0, `${name}: no console errors ${errors.slice(0, 2).join(" | ")}`);
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
