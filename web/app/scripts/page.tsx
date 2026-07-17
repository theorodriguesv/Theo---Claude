"use client";

import { useState } from "react";

type ScriptField = { label: string; content: string };
type ParsedScript = { title: string; fields: ScriptField[]; raw: string };

function parseScripts(markdown: string): ParsedScript[] {
  const lines = markdown.split("\n");
  const scripts: ParsedScript[] = [];
  let current: ParsedScript | null = null;
  let currentField: ScriptField | null = null;
  let rawBuffer: string[] = [];

  const flushField = () => {
    if (current && currentField) current.fields.push(currentField);
    currentField = null;
  };
  const flushScript = () => {
    flushField();
    if (current) {
      current.raw = rawBuffer.join("\n").trim();
      scripts.push(current);
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith("## ")) {
      flushScript();
      rawBuffer = [];
      const title = line.replace(/^##\s*/, "").replace(/^Script\s*\d+\s*:\s*/i, "");
      current = { title: title.trim(), fields: [], raw: "" };
      continue;
    }
    if (!current) continue;
    rawBuffer.push(rawLine);

    const fieldMatch = line.match(/^\*\*(.+?):\*\*\s*(.*)$/);
    if (fieldMatch) {
      flushField();
      currentField = { label: fieldMatch[1].trim(), content: fieldMatch[2].trim() };
      continue;
    }
    if (currentField && line.trim()) {
      currentField.content += "\n" + line.trim();
    }
  }
  flushScript();
  return scripts;
}

function fieldMeta(label: string) {
  const l = label.toLowerCase();
  if (l.includes("gancho")) return { icon: "🎬", tone: "quote" };
  if (l.includes("desenvolvimento")) return { icon: "📋", tone: "list" };
  if (l.includes("cta")) return { icon: "📣", tone: "quote" };
  if (l.includes("legenda")) return { icon: "✏️", tone: "text" };
  if (l.includes("funciona")) return { icon: "💡", tone: "note" };
  return { icon: "•", tone: "text" };
}

function ScriptCard({ script, index }: { script: ParsedScript; index: number }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    await navigator.clipboard.writeText(script.raw);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  return (
    <div className="script-card">
      <div className="script-card-header">
        <span className="script-badge">Script {index + 1}</span>
        <h2>{script.title}</h2>
      </div>

      {script.fields.map((field, i) => {
        const meta = fieldMeta(field.label);
        return (
          <div className="script-field" key={i}>
            <div className="script-field-label">
              <span>{meta.icon}</span>
              {field.label}
            </div>
            {meta.tone === "list" ? (
              <ul>
                {field.content
                  .split("\n")
                  .map((l) => l.replace(/^-\s*/, "").trim())
                  .filter(Boolean)
                  .map((item, k) => (
                    <li key={k}>{item}</li>
                  ))}
              </ul>
            ) : meta.tone === "quote" ? (
              <p className="quote">{field.content.replace(/^"|"$/g, "").trim()}</p>
            ) : meta.tone === "note" ? (
              <p className="note">{field.content}</p>
            ) : (
              <p style={{ whiteSpace: "pre-line" }}>{field.content}</p>
            )}
          </div>
        );
      })}

      <div className="script-copy">
        <button className="secondary" onClick={copiar}>
          {copiado ? "Copiado ✓" : "Copiar script"}
        </button>
      </div>
    </div>
  );
}

export default function GerarScripts() {
  const [numScripts, setNumScripts] = useState(4);
  const [carregando, setCarregando] = useState(false);
  const [scripts, setScripts] = useState<ParsedScript[]>([]);
  const [erro, setErro] = useState("");

  async function gerar() {
    setCarregando(true);
    setErro("");
    setScripts([]);

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

    setScripts(parseScripts(data.scripts as string));
  }

  return (
    <div>
      <h1>Gerar scripts</h1>
      <p className="page-intro">
        Analisa os vídeos de maior engajamento da base e gera roteiros originais para @theo_vasc.
      </p>

      <div className="row card">
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

      {carregando && (
        <div className="loading-state">
          <span className="spinner" />
          Analisando padrões da base e escrevendo os scripts...
        </div>
      )}

      {erro && (
        <p className="erro" style={{ marginTop: 20 }}>
          {erro}
        </p>
      )}

      {scripts.length > 0 && (
        <div className="script-list">
          {scripts.map((s, i) => (
            <ScriptCard script={s} index={i} key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
