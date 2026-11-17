import type { Metadata } from "next";
import "./globals.css";

const title = "Vacaciones Inteligentes Colombia";
const description =
  "Optimizador de vacaciones para Colombia. Encuentra las mejores fechas para maximizar tu descanso usando festivos nacionales y puentes.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vacaciones-inteligentes.vercel.app"),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
