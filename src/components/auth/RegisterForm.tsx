"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import styles from "./RegisterForm.module.css";

const schema = z
  .object({
    first_name: z.string().min(1, "First name is required."),
    last_name: z.string().min(1, "Last name is required."),
    email: z.string().email("Please enter a valid email."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    password_confirm: z.string().min(1, "Please confirm your password."),
  })
  .refine((d) => d.password === d.password_confirm, {
    message: "Passwords do not match.",
    path: ["password_confirm"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      await registerUser(data);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        // Map field-level errors from backend → form fields
        if (err.errors) {
          (Object.keys(err.errors) as Array<keyof FormData>).forEach((field) => {
            if (field in schema.shape) {
              setError(field, { message: err.fieldError(field) });
            }
          });
        } else {
          setServerError(err.message);
        }
      } else {
        setServerError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.header}>
        <h1 className={styles.heading}>Create your account</h1>
        <p className={styles.subheading}>
          Start managing projects with your team
        </p>
      </div>

      {serverError && (
        <div className={styles.serverError} role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {serverError}
        </div>
      )}

      <div className={styles.row}>
        <Input
          label="First name"
          placeholder="Jane"
          autoComplete="given-name"
          error={errors.first_name?.message}
          {...register("first_name")}
        />
        <Input
          label="Last name"
          placeholder="Doe"
          autoComplete="family-name"
          error={errors.last_name?.message}
          {...register("last_name")}
        />
      </div>

      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Password"
        type="password"
        placeholder="Min. 8 characters"
        autoComplete="new-password"
        error={errors.password?.message}
        hint="Must be at least 8 characters."
        {...register("password")}
      />

      <Input
        label="Confirm password"
        type="password"
        placeholder="Repeat your password"
        autoComplete="new-password"
        error={errors.password_confirm?.message}
        {...register("password_confirm")}
      />

      <Button type="submit" fullWidth loading={isSubmitting} size="lg">
        Create account
      </Button>

      <p className={styles.footer}>
        Already have an account?{" "}
        <Link href="/login" className={styles.link}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
