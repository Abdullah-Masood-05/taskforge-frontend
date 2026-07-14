import Link from "next/link";
import btnStyles from "@/components/ui/Button.module.css";
import styles from "./page.module.css";

const DOCS_URL = "https://abdullah-masood-05.github.io/taskforge-site/";

export const metadata = {
  title: "Project management with a mission-control dashboard",
  description:
    "Multi-tenant organizations, a drag-and-drop Kanban board, and live project analytics — on the web and as a native desktop app.",
};

const FEATURES = [
  {
    title: "Kanban board",
    description: "Drag-and-drop tasks across columns with live updates for the whole team.",
  },
  {
    title: "Live analytics",
    description: "Velocity, priority breakdowns, and activity feeds that update in real time.",
  },
  {
    title: "Web + desktop",
    description: "Use it in the browser, or install the native Tauri desktop app.",
  },
];

export default function WelcomePage() {
  return (
    <div className={styles.root}>
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />

      <header className={styles.nav}>
        <span className={styles.logo}>
          <span className={styles.logoIcon}>
            <img src="/Taskforge-New-Logo.svg" alt="" width={30} height={30} />
          </span>
          <span className={styles.logoText}>
            Task<span className={styles.logoTextAccent}>Forge</span>
          </span>
        </span>
        <Link href="/login" className={styles.navLogin}>
          Log in
        </Link>
      </header>

      <main className={styles.hero}>
        <p className={styles.eyebrow}>Multi-tenant project management</p>
        <h1 className={styles.title}>
          Project management with a mission-control dashboard
        </h1>
        <p className={styles.subtitle}>
          Organize work across teams with a drag-and-drop Kanban board, real-time
          activity, and live project analytics — on the web and as a native
          desktop app.
        </p>

        <div className={styles.actions}>
          <Link
            href="/register"
            className={`${btnStyles.button} ${btnStyles.primary} ${btnStyles.lg}`}
          >
            Get Started
          </Link>
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnStyles.button} ${btnStyles.secondary} ${btnStyles.lg}`}
          >
            Documentation
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={16} height={16}>
              <path d="M7 17L17 7M17 7H8M17 7V16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <div className={styles.features}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDescription}>{f.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
