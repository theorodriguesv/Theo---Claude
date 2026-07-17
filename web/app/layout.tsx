import type { ReactNode } from "react";
import "./globals.css";
import NavLinks from "./NavLinks";

export const metadata = {
  title: "Scripts @theo_vasc",
  description: "Análise de vídeos concorrentes e geração de scripts para Instagram",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="shell">
          <header className="topbar">
            <a href="/" className="brand">
              <span className="brand-mark">📊</span>
              <span>Scripts</span>
            </a>
            <NavLinks />
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
