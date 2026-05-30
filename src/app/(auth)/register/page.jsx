import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata = {
  title: "Create account",
  description: "Create your TaskForge account and start managing projects.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
