import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import './evaluation.css';

export const metadata: Metadata = {
  title: "Geometria RPG",
  description: "Congruência, demonstrações e geometria euclidiana.",
  icons: {
    icon: "/assets/crops/lal.png",
    shortcut: "/assets/crops/lal.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
