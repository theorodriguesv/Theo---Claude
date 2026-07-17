"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const CAMPOS_INICIAIS = {
  perfil: "",
  curtidas: "",
  comentarios: "",
  views: "",
  data: "",
  transcricao: "",
};

export default function AdicionarVideo() {
  const router = useRouter();
  const [form, setForm] = useState(CAMPOS_INICIAIS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  function update(campo: keyof typeof CAMPOS_INICIAIS, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro("");

    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setEnviando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErro(data.error || "Erro ao salvar o vídeo.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <h1>Adicionar vídeo concorrente</h1>
      <p className="page-intro">Preencha os dados e cole a transcrição já pronta do vídeo.</p>

      <form onSubmit={handleSubmit} className="form card">
        <label>
          Perfil (@)
          <input
            required
            value={form.perfil}
            onChange={(e) => update("perfil", e.target.value)}
            placeholder="concorrente_exemplo"
          />
        </label>

        <div className="grid4">
          <label>
            Curtidas
            <input
              type="number"
              min="0"
              value={form.curtidas}
              onChange={(e) => update("curtidas", e.target.value)}
            />
          </label>
          <label>
            Comentários
            <input
              type="number"
              min="0"
              value={form.comentarios}
              onChange={(e) => update("comentarios", e.target.value)}
            />
          </label>
          <label>
            Views
            <input
              type="number"
              min="0"
              value={form.views}
              onChange={(e) => update("views", e.target.value)}
            />
          </label>
          <label>
            Data
            <input
              type="date"
              value={form.data}
              onChange={(e) => update("data", e.target.value)}
            />
          </label>
        </div>

        <label>
          Transcrição
          <textarea
            required
            rows={10}
            value={form.transcricao}
            onChange={(e) => update("transcricao", e.target.value)}
            placeholder="Cole aqui a transcrição pronta do vídeo..."
          />
        </label>

        {erro && <p className="erro">{erro}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar vídeo"}
        </button>
      </form>
    </div>
  );
}
