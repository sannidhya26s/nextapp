import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Dev Portfolio Feed",
  description: "Share what you're building with other developers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)}>
      <body className="antialiased">
        <Navbar />
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-3xl px-4 py-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
