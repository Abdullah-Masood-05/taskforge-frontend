"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrgs } from "@/lib/hooks/useOrgs";
import { useAuthStore } from "@/lib/store/authStore";
import styles from "./Sidebar.module.css";

const navItems = [
  { name: "Dashboard", href: "/", icon: "home" },
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
    case "settings":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case "folder":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
      );
    default:
      return null;
  }
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: orgs } = useOrgs();
  const { user, logout } = useAuthStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </span>
          <span className={styles.brandText}>
            <span className={styles.logoName}>TaskForge</span>
            <span className={styles.logoSub}>Terminal Access</span>
          </span>
        </Link>
      </div>

      <nav className={styles.nav}>
        <p className={styles.navLabel}>Core Terminal</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[styles.navItem, isActive ? styles.navItemActive : ""].join(" ")}
            >
              <Icon name={item.icon} className={styles.navIcon} />
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
              const orgBase = `/orgs/${org.slug}`;
              const isOrgActive = pathname.startsWith(orgBase);
              const isProjectsActive = pathname.startsWith(`${orgBase}/projects`);
              return (
                <li key={org.id}>
                  <Link
                    href={`/orgs/${org.slug}`}
                    className={[styles.orgLink, isOrgActive && !isProjectsActive ? styles.orgActive : ""].join(" ")}
                  >
                    <span className={styles.orgInitial}>{org.name.charAt(0)}</span>
                    <span className={styles.orgName}>{org.name}</span>
                  </Link>
                  {isOrgActive && (
                    <Link
                      href={`/orgs/${org.slug}/projects`}
                      className={[styles.subLink, isProjectsActive ? styles.subLinkActive : ""].join(" ")}
                    >
                      <Icon name="folder" className={styles.subIcon} />
                      Projects
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {user && (
        <div className={styles.footer}>
          <button className={styles.userRow} onClick={logout} title="Click to logout">
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user.first_name} {user.last_name}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </button>
        </div>
      )}
    </aside>
  );
}
