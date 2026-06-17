import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chika / ACT Manufacturing | Injection Molding, Metal Fabrication, Automation Equipment",
  description:
    "Dongguan B2B manufacturing partner for injection molding, metal fabrication, automation equipment, tooling, assembly, testing, and overseas RFQ programs.",
  keywords: [
    "injection molding manufacturer China",
    "sheet metal fabrication China",
    "custom automation equipment manufacturer",
    "Dongguan manufacturing supplier",
    "tooling molding metal fabrication assembly",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
