import { redirect } from "next/navigation";

export default function HomePage() {
  // TaskForge doesn't have a public marketing site in this project,
  // so we immediately redirect the root path to the dashboard.
  redirect("/dashboard");
}
