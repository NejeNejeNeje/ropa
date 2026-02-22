import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "ROPA — Trade Clothes While Traveling",
  description: "Swipe to discover clothes from fellow travelers, match on styles you love, and swap — keeping your luggage light and your wardrobe fresh. Join 12K+ travelers on ROPA.",
  keywords: ["travel", "clothes swap", "ropa", "sustainable fashion", "backpacking", "travelers"],
  openGraph: {
    title: "ROPA — Trade Clothes While Traveling",
    description: "Swipe, match, and swap outfits with fellow travelers worldwide.",
    type: "website",
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

