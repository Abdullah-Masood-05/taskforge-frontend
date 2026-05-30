"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrgs } from "@/lib/hooks/useOrgs";
import styles from "./Sidebar.module.css";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "home" },
  { name: "Tasks", href: "/dashboard/tasks", icon: "check-circle" },
  { name: "Settings", href: "/dashboard/settings", icon: "settings" },
];

const Icon = ({ name, className }) => {
  switch (name) {
    case "home":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    case "check-circle":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case "settings":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: orgs } = useOrgs();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          TaskForge
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[styles.link, isActive ? styles.active : ""].join(" ")}
            >
              <Icon name={item.icon} className={styles.icon} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {orgs && orgs.length > 0 && (
        <div className={styles.orgs}>
          <h3 className={styles.orgsTitle}>Organizations</h3>
          <ul className={styles.orgList}>
            {orgs.map((org) => {
              const isActive = pathname.startsWith(`/dashboard/orgs/${org.slug}`);
              return (
                <li key={org.id}>
                  <Link
                    href={`/dashboard/orgs/${org.slug}`}
                    className={[styles.orgLink, isActive ? styles.orgActive : ""].join(" ")}
                  >
                    <span className={styles.orgInitial}>{org.name.charAt(0)}</span>
                    <span className={styles.orgName}>{org.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
}
