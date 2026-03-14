import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthHashHandler } from "@/components/features/auth/auth-hash-handler";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const bricolage = Bricolage_Grotesque({
  variable: "--font-primary",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${bricolage.variable} font-sans antialiased`}>
        <AuthHashHandler />
        {children}
      </body>
    </html>
  );
}
