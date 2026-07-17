import type { VideoRecord } from "./db";

const MAX_VIDEOS_REFERENCIA = 15;
const TRANSCRICAO_MAX_CHARS = 1500;

export const PERFIL_USUARIO = process.env.PERFIL_USUARIO || "@theo_vasc";
export const NICHO =
  process.env.NICHO ||
  "Empreendedorismo, liderança empresarial e assessoria de marketing e vendas para centros automotivos";
export const TOM_DE_VOZ = process.env.TOM_DE_VOZ || "Direto e didático";

export type RelatorioPadroes = {
  total_videos_na_base: number;
  quantidade_usada_como_referencia: number;
  videos_referencia: Array<{
    perfil: string;
    gancho_inicial: string;
    transcricao: string;
  }>;
};

export function montarRelatorioPadroes(db: VideoRecord[]): RelatorioPadroes {
  const maisRecentesPrimeiro = [...db].sort(
    (a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
  );
  const referencia = maisRecentesPrimeiro.slice(0, MAX_VIDEOS_REFERENCIA);

  return {
    total_videos_na_base: db.length,
    quantidade_usada_como_referencia: referencia.length,
    videos_referencia: referencia.map((v) => {
      const transcricao = (v.transcricao || "").slice(0, TRANSCRICAO_MAX_CHARS);
      return {
        perfil: v.perfil,
        gancho_inicial: transcricao.split(/\s+/).slice(0, 25).join(" "),
        transcricao,
      };
    }),
  };
}

export function montarSystemPrompt(numScripts: number): string {
  return `Você é um estrategista de conteúdo especializado em Reels/vídeos curtos para Instagram.

Sua tarefa: analisar os vídeos de perfis concorrentes fornecidos como referência (o usuário já selecionou vídeos que sabe que performaram bem) e criar roteiros 100% ORIGINAIS e inéditos para o perfil ${PERFIL_USUARIO}.

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

**Por que funciona:** [2-3 frases explicando, com base nos padrões observados nos vídeos de referência, por que essa estrutura tende a performar bem]

Responda APENAS com os scripts nesse formato, sem introdução nem conclusão.`;
}
