import type { Metadata } from "next";
import { Oswald, DM_Sans } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BYSAAD — Autonomous Outbound Engine",
  description: "Enterprise Outbound CRM Engine, Visual Auditor & Self-Learning Director for Saad Bin Faisal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#0C0C0C] text-[#F2F2F2] selection:bg-[#C8F135] selection:text-[#0C0C0C]">
        {children}
      </body>
    </html>
  );
}
