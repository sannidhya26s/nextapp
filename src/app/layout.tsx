import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

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
    <html
      lang="en"
      className={cn("dark font-sans", inter.variable, jetbrainsMono.variable)}
    >
      <body className="relative antialiased">
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="scan-sweep absolute inset-x-0 h-40" />
        </div>
        <Navbar />
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-3xl px-4 py-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
