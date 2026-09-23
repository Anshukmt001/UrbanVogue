import type { Metadata } from "next";
import { Anton, Bodoni_Moda, Archivo, Geist_Mono } from "next/font/google";
import { LenisProvider } from "@/components/lenis-provider";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "URBAN VOGUE | Streetwear Redefined",
  description:
    "URBAN VOGUE - Premium streetwear brand. URBAN VOGUE EARLY ACCESS 2026.",
  keywords: ["streetwear", "urban", "fashion", "vogue", "URBAN VOGUE"],
  openGraph: {
    title: "URBAN VOGUE | Streetwear Redefined",
    description:
      "URBAN VOGUE - Premium streetwear brand. URBAN VOGUE EARLY ACCESS 2026.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${bodoni.variable} ${archivo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}