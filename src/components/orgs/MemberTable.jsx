"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useUpdateMemberRole, useRemoveMember } from "@/lib/hooks/useOrgs";
import { ApiError } from "@/lib/api/client";
import styles from "./MemberTable.module.css";

export function MemberTable({ orgSlug, members, currentUserEmail, isAdmin }) {
  const updateRole = useUpdateMemberRole(orgSlug);
  const removeMember = useRemoveMember(orgSlug);
  const [removing, setRemoving] = useState(null);

  const handleRoleChange = async (memberId, role) => {
    try {
      await updateRole.mutateAsync({ memberId, data: { role } });
    } catch (err) {
      if (err instanceof ApiError) alert(err.message);
    }
  };

  const handleRemove = async (memberId) => {
    if (!confirm("Remove this member from the organization?")) return;
    setRemoving(memberId);
    try {
      await removeMember.mutateAsync(memberId);
    } catch (err) {
      if (err instanceof ApiError) alert(err.message);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Member</th>
            <th className={styles.th}>Role</th>
            <th className={styles.th}>Joined</th>
            {isAdmin && <th className={styles.th} />}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const isSelf = m.user_email === currentUserEmail;
            return (
              <tr key={m.id} className={styles.row}>
                <td className={styles.td}>
                  <div className={styles.memberCell}>
                    <Avatar src={m.user_avatar} name={m.user_full_name} size="sm" />
                    <div>
                      <div className={styles.memberName}>
                        {m.user_full_name}
                        {isSelf && <span className={styles.youBadge}>you</span>}
                      </div>
                      <div className={styles.memberEmail}>{m.user_email}</div>
                    </div>
                  </div>
                </td>
                <td className={styles.td}>
                  {isAdmin && !isSelf ? (
                    <select
                      className={styles.roleSelect}
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <Badge variant={m.role}>{m.role}</Badge>
                  )}
                </td>
                <td className={styles.td}>
                  <span className={styles.date}>
                    {new Date(m.joined_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </td>
                {isAdmin && (
                  <td className={styles.td}>
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        loading={removing === m.id}
                        onClick={() => handleRemove(m.id)}
                        className={styles.removeBtn}
                      >
                        Remove
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
