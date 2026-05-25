import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vacaciones Inteligentes Colombia",
  description:
    "Optimizador de vacaciones para Colombia. Encuentra las mejores fechas para maximizar tu descanso usando festivos nacionales y puentes.",
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
