import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your TaskForge account and start managing projects.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
