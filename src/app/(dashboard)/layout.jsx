"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import styles from "./layout.module.css";

export default function DashboardLayout({ children }) {
  return (
    <div className={styles.root}>
      <Sidebar />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
