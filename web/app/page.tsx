import { loadDb } from "@/lib/db";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

function engajamentoBadge(taxa: number) {
  const pct = taxa * 100;
  if (pct >= 8) return { texto: `${pct.toFixed(1)}%`, classe: "badge-good" };
  if (pct >= 4) return { texto: `${pct.toFixed(1)}%`, classe: "badge-neutral" };
  return { texto: `${pct.toFixed(1)}%`, classe: "badge-warn" };
}

export default async function Home() {
  const videos = await loadDb();
  const ordenados = [...videos].sort(
    (a, b) => (b.taxa_engajamento ?? 0) - (a.taxa_engajamento ?? 0)
  );

  const engajamentoMedio =
    videos.length > 0
      ? videos.reduce((soma, v) => soma + (v.taxa_engajamento ?? 0), 0) / videos.length
      : 0;

  const destaque = ordenados[0];

  return (
    <div>
      <h1>Base de vídeos concorrentes</h1>
      <p className="page-intro">
        Vídeos cadastrados para servirem de referência de padrões na geração de scripts.
      </p>

      {videos.length > 0 && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-label">Vídeos na base</div>
            <div className="stat-value">{videos.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Engajamento médio</div>
            <div className="stat-value">{(engajamentoMedio * 100).toFixed(1)}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Maior destaque</div>
            <div className="stat-value" style={{ fontSize: "1.1rem" }}>
              {destaque?.perfil}
            </div>
            <div className="stat-sub">{(destaque?.taxa_engajamento * 100).toFixed(1)}% de engajamento</div>
          </div>
        </div>
      )}

      {videos.length === 0 ? (
        <div className="empty-state">
          Nenhum vídeo cadastrado ainda.
          <br />
          <a href="/adicionar">Adicione o primeiro vídeo concorrente →</a>
        </div>
      ) : (
        <div className="video-list">
          {ordenados.map((v) => {
            const badge = engajamentoBadge(v.taxa_engajamento ?? 0);
            return (
              <div className="video-card" key={v.id}>
                <div className="video-card-main">
                  <div className="video-profile">{v.perfil}</div>
                  <div className="video-date">{v.data || "sem data"}</div>
                </div>
                <div className="video-metrics">
                  <div className="metric">
                    <div className="metric-label">Curtidas</div>
                    <div className="metric-value">{v.curtidas.toLocaleString("pt-BR")}</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Comentários</div>
                    <div className="metric-value">{v.comentarios.toLocaleString("pt-BR")}</div>
                  </div>
                  <div className="metric">
                    <div className="metric-label">Views</div>
                    <div className="metric-value">{v.views.toLocaleString("pt-BR")}</div>
                  </div>
                </div>
                <span className={`badge ${badge.classe}`}>{badge.texto}</span>
                <DeleteButton id={v.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
