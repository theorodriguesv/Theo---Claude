"use client";

import { useState } from "react";

export default function GerarScripts() {
  const [numScripts, setNumScripts] = useState(4);
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState("");
  const [erro, setErro] = useState("");

  async function gerar() {
    setCarregando(true);
    setErro("");
    setResultado("");

    const res = await fetch("/api/gerar-scripts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numScripts }),
    });

    const data = await res.json().catch(() => ({}));
    setCarregando(false);

    if (!res.ok) {
      setErro(data.error || "Erro ao gerar os scripts.");
      return;
    }

    setResultado(data.scripts);
  }

  return (
    <div>
      <h1>Gerar scripts</h1>
      <p>Analisa os vídeos de maior engajamento da base e gera roteiros originais para @theo_vasc.</p>

      <div className="row" style={{ marginTop: 20 }}>
        <label>
          Quantidade de scripts
          <select value={numScripts} onChange={(e) => setNumScripts(Number(e.target.value))}>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </label>
        <button onClick={gerar} disabled={carregando}>
          {carregando ? "Gerando..." : "Gerar scripts"}
        </button>
      </div>

      {erro && <p className="erro">{erro}</p>}
      {resultado && <pre className="resultado">{resultado}</pre>}
    </div>
  );
}
