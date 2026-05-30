"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/authStore";
import { Avatar } from "@/components/ui/Avatar";
import styles from "./Sidebar.module.css";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
    <rect x="3" y="3" width="7" height="7" rx="2" />
    <rect x="14" y="3" width="7" height="7" rx="2" />
    <rect x="3" y="14" width="7" height="7" rx="2" />
    <rect x="14" y="14" width="7" height="7" rx="2" />
  </svg>
);

const OrgsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <DashboardIcon />, exact: true },
  { href: "/dashboard/orgs", label: "Organizations", icon: <OrgsIcon /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  function isActive(item: NavItem): boolean {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <aside className={styles.sidebar}>
      {/* ── Logo ───────────────────────────────────────────── */}
      <div className={styles.logoArea}>
        <Link href="/dashboard" className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logoGrad)" />
              <path d="M9 10h14M9 16h9M9 22h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className={styles.logoName}>TaskForge</span>
        </Link>
      </div>

      {/* ── Nav ────────────────────────────────────────────── */}
      <nav className={styles.nav} aria-label="Main navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={[styles.navItem, isActive(item) ? styles.navItemActive : ""].join(" ")}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className={styles.footer}>
        <Link href="/dashboard/settings" className={[styles.navItem, styles.settingsLink].join(" ")}>
          <span className={styles.navIcon}><SettingsIcon /></span>
          <span>Settings</span>
        </Link>

        {user && (
          <div className={styles.userRow}>
            <Avatar src={user.avatar} name={user.full_name} size="sm" />
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.full_name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
