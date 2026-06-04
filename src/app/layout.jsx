import { Inter } from "next/font/google";
import QueryProvider from "@/components/layout/QueryProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: {
    template: "%s | TaskForge",
    default: "TaskForge — Modern Team Project Management",
  },
  description: "Built for modern teams to manage projects and tasks efficiently.",
  icons: {
    icon: "/Taskforge-New-Logo.svg",
    apple: "/Taskforge-New-Logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
