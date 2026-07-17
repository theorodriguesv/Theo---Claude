"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const CAMPOS_INICIAIS = {
  perfil: "",
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
      <p className="page-intro">
        Não é preciso enviar o vídeo — só o perfil e o texto da transcrição já pronta.
      </p>

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

        <label>
          Transcrição (texto)
          <textarea
            required
            rows={10}
            value={form.transcricao}
            onChange={(e) => update("transcricao", e.target.value)}
            placeholder="Cole aqui o texto da transcrição do vídeo (fale, digite ou copie de onde você já transcreveu — nenhum arquivo de vídeo é enviado aqui)."
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
