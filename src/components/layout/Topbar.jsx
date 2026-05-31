"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/lib/hooks/useAuth";
import styles from "./Topbar.module.css";

export function Topbar({ title, actions }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {title && <h1 className={styles.title}>{title}</h1>}
      </div>

      <div className={styles.right}>
        {actions && <div className={styles.actions}>{actions}</div>}

        <div className={styles.userMenu}>
          <button
            className={styles.avatarBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            id="user-menu-button"
          >
            <Avatar src={user?.avatar} name={user?.full_name} size="sm" />
            <span className={styles.userName}>{user?.first_name ?? user?.email?.split("@")[0]}</span>
            <svg className={[styles.chevron, menuOpen ? styles.chevronUp : ""].join(" ")} viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />
              <div className={styles.dropdown} role="menu" aria-labelledby="user-menu-button">
                <div className={styles.dropdownHeader}>
                  <Avatar src={user?.avatar} name={user?.full_name} size="md" />
                  <div>
                    <div className={styles.dropdownName}>{user?.full_name}</div>
                    <div className={styles.dropdownEmail}>{user?.email}</div>
                  </div>
                </div>
                <div className={styles.dropdownDivider} />
                <button
                  className={styles.dropdownItem}
                  role="menuitem"
                  onClick={() => { setMenuOpen(false); router.push("/"); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                  Settings
                </button>
                <div className={styles.dropdownDivider} />
                <button
                  className={[styles.dropdownItem, styles.dropdownLogout].join(" ")}
                  role="menuitem"
                  onClick={handleLogout}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
