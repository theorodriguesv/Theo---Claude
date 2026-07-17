import type { VideoRecord } from "./db";

const TOP_N_VIDEOS = 8;
const TRANSCRICAO_MAX_CHARS = 1500;

export const PERFIL_USUARIO = process.env.PERFIL_USUARIO || "@theo_vasc";
export const NICHO =
  process.env.NICHO ||
  "Empreendedorismo, liderança empresarial e assessoria de marketing e vendas para centros automotivos";
export const TOM_DE_VOZ = process.env.TOM_DE_VOZ || "Direto e didático";

export type RelatorioPadroes = {
  total_videos_na_base: number;
  quantidade_usada_como_referencia: number;
  videos_referencia_ordenados_por_engajamento: Array<{
    perfil: string;
    curtidas: number;
    comentarios: number;
    views: number;
    taxa_engajamento: number;
    data: string;
    gancho_inicial: string;
    transcricao: string;
  }>;
};

export function montarRelatorioPadroes(db: VideoRecord[]): RelatorioPadroes {
  const ordenados = [...db].sort(
    (a, b) => (b.taxa_engajamento ?? -1) - (a.taxa_engajamento ?? -1)
  );
  const top = ordenados.slice(0, TOP_N_VIDEOS);

  return {
    total_videos_na_base: db.length,
    quantidade_usada_como_referencia: top.length,
    videos_referencia_ordenados_por_engajamento: top.map((v) => {
      const transcricao = (v.transcricao || "").slice(0, TRANSCRICAO_MAX_CHARS);
      return {
        perfil: v.perfil,
        curtidas: v.curtidas,
        comentarios: v.comentarios,
        views: v.views,
        taxa_engajamento: v.taxa_engajamento,
        data: v.data,
        gancho_inicial: transcricao.split(/\s+/).slice(0, 25).join(" "),
        transcricao,
      };
    }),
  };
}

export function montarSystemPrompt(numScripts: number): string {
  return `Você é um estrategista de conteúdo especializado em Reels/vídeos curtos para Instagram.

Sua tarefa: analisar os vídeos de MAIOR ENGAJAMENTO de perfis concorrentes (fornecidos como referência) e criar roteiros 100% ORIGINAIS e inéditos para o perfil ${PERFIL_USUARIO}.

Contexto do perfil ${PERFIL_USUARIO}:
- Nicho: ${NICHO}
- Tom de voz: ${TOM_DE_VOZ}

Regras obrigatórias:
1. NUNCA copie falas literais dos vídeos concorrentes. Use-os apenas como referência de padrões: estrutura do gancho, ritmo, tipo de CTA, temas que funcionam, formato.
2. Todo o conteúdo deve ser original e adequado ao nicho e tom de voz de ${PERFIL_USUARIO}.
3. Gere exatamente ${numScripts} scripts.
4. Para CADA script, siga rigorosamente este formato em Markdown:

## Script N: [título curto e descritivo]

**Gancho (primeiros 3s):** "[frase literal, pronta para ser dita no vídeo]"

**Desenvolvimento:**
- [bullet 1]
- [bullet 2]
- [bullet 3, se necessário]

**CTA final:** "[frase literal, pronta para ser dita]"

**Sugestão de legenda:** [legenda pronta para colar no Instagram, com quebras de linha e hashtags relevantes ao nicho]

**Por que funciona:** [2-3 frases explicando, com base nos padrões observados nos vídeos de referência (cite números/engajamento quando fizer sentido), por que essa estrutura tende a performar bem]

Responda APENAS com os scripts nesse formato, sem introdução nem conclusão.`;
}
