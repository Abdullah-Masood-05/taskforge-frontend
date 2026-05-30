"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useInviteMember } from "@/lib/hooks/useOrgs";
import { ApiError } from "@/lib/api/client";
import styles from "./InviteModal.module.css";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  role: z.enum(["admin", "member", "viewer"]),
});

export function InviteModal({ orgSlug, isOpen, onClose }) {
  const invite = useInviteMember(orgSlug);
  const [success, setSuccess] = useState(null);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { role: "member" },
  });

  const handleClose = () => {
    reset();
    setSuccess(null);
    setServerError(null);
    onClose();
  };

  const onSubmit = async (data) => {
    setServerError(null);
    setSuccess(null);
    try {
      await invite.mutateAsync(data);
      setSuccess(`Invitation sent to ${data.email}`);
      reset();
    } catch (err) {
      if (err instanceof ApiError) {
        const emailErr = err.fieldError("email");
        if (emailErr) {
          setError("email", { message: emailErr });
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError("Failed to send invitation. Please try again.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite team member"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            form="invite-form"
            type="submit"
            loading={isSubmitting}
          >
            Send invite
          </Button>
        </>
      }
    >
      {success && (
        <div className={styles.success}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {success}
        </div>
      )}

      {serverError && (
        <div className={styles.error}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {serverError}
        </div>
      )}

      <form id="invite-form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Input
          label="Email address"
          type="email"
          placeholder="colleague@company.com"
          error={errors.email?.message}
          autoFocus
          {...register("email")}
        />

        <div className={styles.field}>
          <label className={styles.label} htmlFor="invite-role">
            Role
          </label>
          <select id="invite-role" className={styles.select} {...register("role")}>
            <option value="member">Member — can view and edit</option>
            <option value="admin">Admin — full access</option>
            <option value="viewer">Viewer — read-only access</option>
          </select>
          {errors.role && (
            <p className={styles.fieldError}>{errors.role.message}</p>
          )}
        </div>
      </form>
    </Modal>
  );
}
