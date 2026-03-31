import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CardVault",
  description: "AI-powered sports trading card manager",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CardVault",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#00274C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="bg-maize text-blue font-bold px-4 py-3 flex items-center shadow-md">
          <span className="text-xl">CardVault</span>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 pb-[72px]">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
