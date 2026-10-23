// Scheduled function: keeps the Render API from spinning down.
//
// Render's free plan stops a web service after 15 minutes without inbound
// traffic, and the next visitor then waits about a minute for a cold boot.
// Netlify runs this every 5 minutes. /health/ answers without touching the
// database, so the Neon database can still scale to zero when nobody is
// using the app.
const HEALTH_URL = "https://taskforge-api-mu6x.onrender.com/health/";

export default async () => {
  const started = Date.now();
  try {
    const res = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(25_000) });
    console.log(`keep-api-awake: HTTP ${res.status} in ${Date.now() - started} ms`);
  } catch (err) {
    console.log(`keep-api-awake: failed after ${Date.now() - started} ms: ${err}`);
  }
  return new Response("ok");
};

export const config = {
  schedule: "*/5 * * * *",
};
