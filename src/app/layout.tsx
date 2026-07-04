import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "LAT — LASU Academic Timetable",
  description: "Constraint-based timetable generation for Lagos State University",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-(--color-bg) text-(--color-text-primary)">
        {children}
      </body>
    </html>
  );
}
