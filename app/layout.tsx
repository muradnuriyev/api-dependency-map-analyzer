import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/components/Layout/SettingsProvider";
import SettingsTray from "@/components/Layout/SettingsTray";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "API Dependency Map Analyzer",
  description: "Visualize OpenAPI dependencies, metrics, and hotspots.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SettingsProvider>
          <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
            {children}
            <SettingsTray />
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
