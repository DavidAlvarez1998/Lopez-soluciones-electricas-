import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-barlow-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | López Soluciones Eléctricas",
    default: "López Soluciones Eléctricas",
  },
  description:
    "Soluciones eléctricas integrales en Pereira, Risaralda. Sector residencial, industrial, comercial e institucional. Certificación RETIE. Emergencias 24/7.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${barlow.variable} ${barlowCondensed.variable}`}
    >
      <body className="font-sans bg-navy text-off-white antialiased">
        {children}
      </body>
    </html>
  );
}
