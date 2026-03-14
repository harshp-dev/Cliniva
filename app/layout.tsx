import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthHashHandler } from "@/components/features/auth/auth-hash-handler";

const sansFont = localFont({
  src: [
    {
      path: "./fonts/GeistVF.woff",
      style: "normal"
    }
  ],
  variable: "--font-sans",
  display: "swap"
});

const primaryFont = localFont({
  src: [
    {
      path: "./fonts/GeistVF.woff",
      style: "normal"
    }
  ],
  variable: "--font-primary",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Cliniva - API-First Virtual Health Platform",
  description:
    "The foundational infrastructure for virtual health. Reduce time-to-market from months to days with API-first EHR, embeddable care tools, white-label support, and full HIPAA compliance out of the box.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", sansFont.variable)}>
      <body className={cn(primaryFont.variable, "font-sans antialiased")}>
        <AuthHashHandler />
        {children}
      </body>
    </html>
  );
}
