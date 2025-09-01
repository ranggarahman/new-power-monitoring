import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-sans-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Central Monitoring Dashboard",
  description: "Spare Part, Lifetime, and Power Monitoring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${mulish.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
