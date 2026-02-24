import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const viewport: Viewport = {
  themeColor: "#c8a86b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "ROPA — Trade Clothes While Traveling",
  description: "Swipe to discover clothes from fellow travelers, match on styles you love, and swap — keeping your luggage light and your wardrobe fresh. Join 12K+ travelers on ROPA.",
  keywords: ["travel", "clothes swap", "ropa", "sustainable fashion", "backpacking", "travelers"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "ROPA — Trade Clothes While Traveling",
    description: "Swipe, match, and swap outfits with fellow travelers worldwide.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ROPA — Trade Clothes While Traveling" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ROPA — Trade Clothes While Traveling",
    description: "Swipe, match, and swap outfits with fellow travelers worldwide.",
    images: ["/og-image.png"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ROPA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

