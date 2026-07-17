"""Análise de padrões da base de vídeos + geração de novos scripts via API Claude."""
import json

from . import config

TOP_N_VIDEOS = 8
TRANSCRICAO_MAX_CHARS = 1200


def _engajamento_ou_menos_infinito(record):
    valor = record.get("taxa_engajamento")
    return valor if valor is not None else -1


def montar_relatorio_padroes(db: dict) -> dict:
    """Resume a base de vídeos nos dados mais relevantes para embasar a geração de scripts."""
    videos = list(db.values())
    videos_ordenados = sorted(videos, key=_engajamento_ou_menos_infinito, reverse=True)
    top_videos = videos_ordenados[:TOP_N_VIDEOS]

    top_resumido = []
    for v in top_videos:
        transcricao = (v.get("transcricao") or "")[:TRANSCRICAO_MAX_CHARS]
        top_resumido.append(
            {
                "perfil": v.get("perfil"),
                "curtidas": v.get("curtidas"),
                "comentarios": v.get("comentarios"),
                "views": v.get("views"),
                "taxa_engajamento": v.get("taxa_engajamento"),
                "data": v.get("data"),
                "gancho_inicial": " ".join(transcricao.split()[:25]),
                "transcricao": transcricao,
            }
        )

    return {
        "total_videos_na_base": len(videos),
        "quantidade_usada_como_referencia": len(top_resumido),
        "videos_referencia_ordenados_por_engajamento": top_resumido,
    }


def montar_system_prompt(num_scripts: int) -> str:
    return f"""Você é um estrategista de conteúdo especializado em Reels/vídeos curtos para Instagram.

Sua tarefa: analisar os vídeos de MAIOR ENGAJAMENTO de perfis concorrentes (fornecidos como \
referência) e criar roteiros 100% ORIGINAIS e inéditos para o perfil {config.PERFIL_USUARIO}.

Contexto do perfil {config.PERFIL_USUARIO}:
- Nicho: {config.NICHO}
- Tom de voz: {config.TOM_DE_VOZ}

Regras obrigatórias:
1. NUNCA copie falas literais dos vídeos concorrentes. Use-os apenas como referência de \
padrões: estrutura do gancho, ritmo, tipo de CTA, temas que funcionam, formato.
2. Todo o conteúdo deve ser original e adequado ao nicho e tom de voz de {config.PERFIL_USUARIO}.
3. Gere exatamente {num_scripts} scripts.
4. Para CADA script, siga rigorosamente este formato em Markdown:

## Script N: [título curto e descritivo]

**Gancho (primeiros 3s):** "[frase literal, pronta para ser dita no vídeo]"

**Desenvolvimento:**
- [bullet 1]
- [bullet 2]
- [bullet 3, se necessário]

**CTA final:** "[frase literal, pronta para ser dita]"

**Sugestão de legenda:** [legenda pronta para colar no Instagram, com quebras de linha e \
hashtags relevantes ao nicho]

**Por que funciona:** [2-3 frases explicando, com base nos padrões observados nos vídeos de \
referência (cite números/engajamento quando fizer sentido), por que essa estrutura tende a \
performar bem]

Responda APENAS com os scripts nesse formato, sem introdução nem conclusão."""


def gerar_scripts_com_claude(pattern_report: dict, num_scripts: int = 4) -> str:
    if not config.ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY não configurada. Defina no arquivo .env "
            "(veja .env.example) para poder gerar os scripts."
        )

    try:
        from anthropic import Anthropic
    except ImportError as exc:
        raise RuntimeError(
            "biblioteca 'anthropic' não está instalada. Rode: pip install -r requirements.txt"
        ) from exc

    client = Anthropic(api_key=config.ANTHROPIC_API_KEY)
    system_prompt = montar_system_prompt(num_scripts)
    user_content = (
        "Base de vídeos concorrentes de alta performance (JSON), ordenada por engajamento:\n\n"
        + json.dumps(pattern_report, ensure_ascii=False, indent=2)
    )

    response = client.messages.create(
        model=config.CLAUDE_MODEL,
        max_tokens=4096,
        system=system_prompt,
        messages=[{"role": "user", "content": user_content}],
    )
    return "".join(block.text for block in response.content if block.type == "text")
