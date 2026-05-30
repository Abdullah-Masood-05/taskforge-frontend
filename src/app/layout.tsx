import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/layout/QueryProvider";

export const metadata: Metadata = {
  title: {
    default: "TaskForge",
    template: "%s · TaskForge",
  },
  description:
    "TaskForge — multi-tenant project management SaaS. Organize teams, track tasks, and ship faster.",
  keywords: ["project management", "task tracking", "team collaboration", "SaaS"],
  openGraph: {
    type: "website",
    siteName: "TaskForge",
    title: "TaskForge",
    description: "Multi-tenant project management SaaS",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
