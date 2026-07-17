import { NextRequest, NextResponse } from "next/server";
import { addVideo, deleteVideo, loadDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await loadDb();
  return NextResponse.json(db);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.perfil || !body.transcricao) {
    return NextResponse.json(
      { error: "Campos 'perfil' e 'transcricao' são obrigatórios." },
      { status: 400 }
    );
  }

  const perfil: string = String(body.perfil).trim();

  const novo = await addVideo({
    perfil: perfil.startsWith("@") ? perfil : `@${perfil}`,
    transcricao: String(body.transcricao),
  });

  return NextResponse.json(novo, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.id) {
    return NextResponse.json({ error: "Campo 'id' é obrigatório." }, { status: 400 });
  }
  await deleteVideo(String(body.id));
  return NextResponse.json({ ok: true });
}
