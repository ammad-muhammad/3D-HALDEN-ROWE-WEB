import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Halden & Rowe | Bespoke Tailors, Est. 1927",
  description: "Bespoke tailoring since 1927. Worn once. Remembered always.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload suit image so it is ready immediately */}
        <link rel="preload" as="image" href="/images/final-suit.png" />
      </head>
      <body className={`${cormorantGaramond.variable} ${jost.variable}`}>
        {children}
      </body>
    </html>
  );
}
