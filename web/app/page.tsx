import { loadDb } from "@/lib/db";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

function formatarData(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function Home() {
  const videos = await loadDb();
  const ordenados = [...videos].sort(
    (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
  );

  return (
    <div>
      <h1>Base de vídeos concorrentes</h1>
      <p className="page-intro">
        {videos.length} vídeo(s) cadastrado(s) como referência para a geração de scripts.
      </p>

      {videos.length === 0 ? (
        <div className="empty-state">
          Nenhum vídeo cadastrado ainda.
          <br />
          <a href="/adicionar">Adicione o primeiro vídeo concorrente →</a>
        </div>
      ) : (
        <div className="video-list">
          {ordenados.map((v) => (
            <div className="video-card" key={v.id}>
              <div className="video-card-top">
                <div className="video-card-main">
                  <div className="video-profile">{v.perfil}</div>
                  <div className="video-date">adicionado em {formatarData(v.criado_em)}</div>
                </div>
                <DeleteButton id={v.id} />
              </div>
              <p className="video-preview">{v.transcricao}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
