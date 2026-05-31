"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card, CardBody } from "@/components/ui/Card";
import styles from "./OrgCard.module.css";

const BuildingIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <rect x="3" y="9" width="18" height="12" rx="2" />
    <path d="M8 9V6a4 4 0 0 1 8 0v3" />
    <line x1="12" y1="13" x2="12" y2="17" />
  </svg>
);

export function OrgCard({ org }) {
  return (
    <Link href={`/orgs/${org.slug}`} className={styles.link}>
      <Card hoverable className={styles.card}>
        <CardBody>
          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <BuildingIcon />
            </div>
            <Badge variant={org.plan}>{org.plan}</Badge>
          </div>

          <h3 className={styles.name}>{org.name}</h3>
          <p className={styles.slug}>/{org.slug}</p>

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Members
            </span>
            <span className={styles.arrow}>→</span>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}
