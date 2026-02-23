import type { Metadata, Viewport } from "next";
import { Red_Hat_Display, Figtree } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import SidebarNav from "@/components/SidebarNav";
import ThemeProvider from "@/components/ThemeProvider";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-display",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nootbook",
  description: "Simple AI-powered nutrition tracker",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${redHatDisplay.variable} ${figtree.variable} antialiased`}
      >
        <ThemeProvider>
          <div className="md:flex md:min-h-screen">
            <SidebarNav />
            <main className="flex-1 md:ml-[240px]">
              {children}
            </main>
          </div>
          <div className="md:hidden">
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
