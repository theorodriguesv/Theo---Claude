import { loadDb } from "@/lib/db";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function Home() {
  const videos = await loadDb();
  const ordenados = [...videos].sort(
    (a, b) => (b.taxa_engajamento ?? 0) - (a.taxa_engajamento ?? 0)
  );

  return (
    <div>
      <h1>Base de vídeos concorrentes</h1>
      <p>{videos.length} vídeo(s) cadastrado(s).</p>

      {videos.length === 0 && (
        <p>
          Nenhum vídeo ainda. <a href="/adicionar">Adicione o primeiro</a>.
        </p>
      )}

      {videos.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Perfil</th>
              <th>Curtidas</th>
              <th>Comentários</th>
              <th>Views</th>
              <th>Engajamento</th>
              <th>Data</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((v) => (
              <tr key={v.id}>
                <td>{v.perfil}</td>
                <td>{v.curtidas.toLocaleString("pt-BR")}</td>
                <td>{v.comentarios.toLocaleString("pt-BR")}</td>
                <td>{v.views.toLocaleString("pt-BR")}</td>
                <td>{(v.taxa_engajamento * 100).toFixed(2)}%</td>
                <td>{v.data}</td>
                <td>
                  <DeleteButton id={v.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
