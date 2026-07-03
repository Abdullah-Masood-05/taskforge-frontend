/* Headless smoke run: login -> board -> screenshots of the dashboard. */
const { chromium } = require("playwright");

const BOARD_URL =
  "http://localhost:3000/orgs/taskforge-demo/projects/7efce972-3a76-4177-a8f4-34e68bf3e7bb/board";

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1720, height: 1000 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });

  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', "admin@taskforge.dev");
  await page.fill('input[type="password"]', "TaskForge2024!");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/orgs**", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  console.log("after login url:", page.url());

  await page.goto(BOARD_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Workflow Stages", { timeout: 25000 });
  await page.waitForSelector("text=Team Velocity", { timeout: 15000 });
  // Let recharts animations, avatars and websocket settle
  await page.waitForTimeout(4000);

  await page.screenshot({ path: "scripts/board-viewport.png" });
  await page.screenshot({ path: "scripts/board-full.png", fullPage: true });

  const headerText = await page.textContent("h1").catch(() => null);
  console.log("h1:", headerText);
  const panels = [];
  for (const t of ["Project Timeline", "Team Velocity", "Task Distribution", "Activity"]) {
    panels.push(`${t}: ${(await page.locator(`text=${t}`).count()) > 0 ? "OK" : "MISSING"}`);
  }
  console.log(panels.join(" | "));
  const cardCount = await page.locator('[data-rfd-draggable-id], [class*="card"]').count();
  console.log("card-ish elements:", cardCount);
  console.log("console/page errors:", errors.length ? errors.slice(0, 8) : "none");

  await browser.close();
})().catch((e) => {
  console.error("SMOKE FAILED:", e.message);
  process.exit(1);
});
