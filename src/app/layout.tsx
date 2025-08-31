import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Image Compliance Tool: Detect & Fix Sensitive Elements",
  description: "Free AI tool to detect sensitive elements (logos, trademarks, copyrighted content) in images and generate compliant versions. Avoid copyright risks—upload, scan, fix, and download in seconds!",
  keywords: "image compliance tool, detect sensitive elements in images, remove trademarks from images, AI image moderation, generate compliant images, fix copyright issues in images, online image editing for compliance, Gemini image tool",
  openGraph: {
    title: "AI Image Compliance Tool: Detect Sensitive Elements & Generate Copyright-Safe Images",
    description: "Free AI tool to detect sensitive elements (logos, trademarks, copyrighted content) in images and generate compliant versions. Avoid copyright risks—upload, scan, fix, and download in seconds!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Compliance Tool: Detect Sensitive Elements & Generate Copyright-Safe Images",
    description: "Free AI tool to detect sensitive elements (logos, trademarks, copyrighted content) in images and generate compliant versions. Avoid copyright risks—upload, scan, fix, and download in seconds!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
