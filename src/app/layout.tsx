import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MaintenancePage from "./maintenance/page";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "LAT — LASU Academic Timetable",
  description: "Constraint-based timetable generation for Lagos State University",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteEnabled = process.env.SITE_ENABLED === "true";

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-(--color-bg) text-(--color-text-primary)">
        {siteEnabled ? children : <MaintenancePage />}
      </body>
    </html>
  );
}
