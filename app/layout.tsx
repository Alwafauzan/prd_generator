import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRD Generator — SIMRS",
  description: "Generate PRD dari BPMN + draft (System Analyst SIMRS tipe C & D)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
