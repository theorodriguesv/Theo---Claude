import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { loadDb } from "@/lib/db";
import { montarRelatorioPadroes, montarSystemPrompt } from "@/lib/promptBuilder";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY não configurada nas variáveis de ambiente do projeto." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const numScripts = Math.min(5, Math.max(3, Number(body.numScripts) || 4));

  const db = await loadDb();
  if (db.length === 0) {
    return NextResponse.json(
      { error: "Nenhum vídeo cadastrado ainda. Adicione vídeos concorrentes primeiro." },
      { status: 400 }
    );
  }

  const relatorio = montarRelatorioPadroes(db);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const response = await client.messages.create({
    model: process.env.CLAUDE_MODEL || "claude-sonnet-5",
    max_tokens: 4096,
    system: montarSystemPrompt(numScripts),
    messages: [
      {
        role: "user",
        content:
          "Base de vídeos concorrentes de alta performance (JSON), ordenada por engajamento:\n\n" +
          JSON.stringify(relatorio, null, 2),
      },
    ],
  });

  const texto = response.content
    .filter((bloco): bloco is Anthropic.TextBlock => bloco.type === "text")
    .map((bloco) => bloco.text)
    .join("");

  return NextResponse.json({ scripts: texto, baseadoEm: relatorio.total_videos_na_base });
}
