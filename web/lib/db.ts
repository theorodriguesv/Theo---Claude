import { list, put } from "@vercel/blob";

const DB_PATHNAME = "videos-db.json";

export type VideoRecord = {
  id: string;
  perfil: string;
  curtidas: number;
  comentarios: number;
  views: number;
  data: string;
  transcricao: string;
  taxa_engajamento: number;
  criado_em: string;
};

export type NovoVideoInput = {
  perfil: string;
  curtidas: number;
  comentarios: number;
  views: number;
  data: string;
  transcricao: string;
};

export async function loadDb(): Promise<VideoRecord[]> {
  const { blobs } = await list({ prefix: DB_PATHNAME });
  const atual = blobs.find((b) => b.pathname === DB_PATHNAME);
  if (!atual) return [];

  const res = await fetch(atual.url, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as VideoRecord[];
}

export async function saveDb(registros: VideoRecord[]): Promise<void> {
  await put(DB_PATHNAME, JSON.stringify(registros, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function calcularEngajamento(curtidas: number, comentarios: number, views: number): number {
  if (!views || views <= 0) return 0;
  return (curtidas + comentarios) / views;
}

export async function addVideo(input: NovoVideoInput): Promise<VideoRecord> {
  const db = await loadDb();
  const novo: VideoRecord = {
    id: crypto.randomUUID(),
    perfil: input.perfil,
    curtidas: input.curtidas,
    comentarios: input.comentarios,
    views: input.views,
    data: input.data,
    transcricao: input.transcricao,
    taxa_engajamento: calcularEngajamento(input.curtidas, input.comentarios, input.views),
    criado_em: new Date().toISOString(),
  };
  db.push(novo);
  await saveDb(db);
  return novo;
}

export async function deleteVideo(id: string): Promise<void> {
  const db = await loadDb();
  await saveDb(db.filter((v) => v.id !== id));
}
