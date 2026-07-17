import type { ReactNode } from "react";
import "./globals.css";

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
              📊 Scripts @theo_vasc
            </a>
            <nav>
              <a href="/">Base de vídeos</a>
              <a href="/adicionar">+ Adicionar vídeo</a>
              <a href="/scripts">Gerar scripts</a>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
