/* Capture the documentation screenshots for taskforge-site.
   Requires backend on :8000 (seeded) and frontend on :3000. */
const path = require("path");
const { chromium } = require("playwright");

const OUT = path.resolve(
  __dirname,
  "../../taskforge-site/public/screenshots"
);
const EMAIL = "admin@taskforge.dev";
const PASSWORD = "TaskForge2024!";
const ORG = "taskforge-demo";

const shot = (name) => path.join(OUT, `${name}.png`);

(async () => {
  // Resolve the demo project id through the API so the script survives reseeds.
  const loginResp = await fetch("http://127.0.0.1:8000/api/v1/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  const { access } = await loginResp.json();
  const projResp = await fetch("http://127.0.0.1:8000/api/v1/projects/", {
    headers: {
      Authorization: `Bearer ${access}`,
      "X-Organization-Slug": ORG,
    },
  });
  const projects = await projResp.json();
  const list = projects.results ?? projects;
  const demo =
    list.find((p) => /relaunch/i.test(p.name)) ?? list[0];
  if (!demo) throw new Error("no project found in demo org");
  const BOARD_URL = `http://localhost:3000/orgs/${ORG}/projects/${demo.id}/board`;
  console.log("board:", BOARD_URL);

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1720, height: 1000 },
    deviceScaleFactor: 2, // crisp images for the docs
  });

  // 1. Login page (before authenticating)
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: shot("login") });
  console.log("login.png");

  // Log in
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL("**/orgs**", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // 2. Dashboard home (org cards)
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: shot("orgs-home") });
  console.log("orgs-home.png");

  // 3. Organization page (member table)
  await page.goto(`http://localhost:3000/orgs/${ORG}`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: shot("org-members") });
  console.log("org-members.png");

  // 4. Projects list
  await page.goto(`http://localhost:3000/orgs/${ORG}/projects`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: shot("projects-list") });
  console.log("projects-list.png");

  // 5. Board + dashboard (the money shot)
  await page.goto(BOARD_URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("text=Workflow Stages", { timeout: 25000 });
  await page.waitForSelector("text=Team Velocity", { timeout: 15000 });
  await page.waitForTimeout(4500); // recharts animations, avatars, ws settle
  await page.screenshot({ path: shot("board-dashboard") });
  console.log("board-dashboard.png");

  // 6. Rail panels as element shots
  const panels = [
    ['section[aria-label="Project timeline"]', "timeline"],
    ['section[aria-label="Team velocity"]', "velocity"],
    ['section[aria-label="Task distribution by priority"]', "distribution"],
    ['section[aria-label="Recent activity"]', "activity"],
  ];
  for (const [sel, name] of panels) {
    const el = page.locator(sel);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await el.screenshot({ path: shot(name) });
    console.log(`${name}.png`);
  }

  // 7. Task detail modal — click the first card
  const card = page.locator("[data-rfd-draggable-id]").first();
  await card.scrollIntoViewIfNeeded();
  await card.click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: shot("task-detail") });
  console.log("task-detail.png");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);

  // 8. Import modal — More menu -> Import Project…
  await page.click('button[aria-haspopup="menu"]');
  await page.waitForTimeout(400);
  await page.click("text=Import Project…");
  await page.waitForTimeout(1000);
  await page.screenshot({ path: shot("import-modal") });
  console.log("import-modal.png");
  await page.keyboard.press("Escape");

  // 9. Swagger UI
  await page.goto("http://127.0.0.1:8000/api/v1/docs/", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: shot("swagger") });
  console.log("swagger.png");

  await browser.close();
  console.log("ALL DONE ->", OUT);
})().catch((e) => {
  console.error("CAPTURE FAILED:", e.message);
  process.exit(1);
});
