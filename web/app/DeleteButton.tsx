"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [removendo, setRemovendo] = useState(false);

  async function handleDelete() {
    if (!confirm("Remover este vídeo da base?")) return;
    setRemovendo(true);
    await fetch("/api/videos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setRemovendo(false);
    router.refresh();
  }

  return (
    <button className="link-danger" onClick={handleDelete} disabled={removendo}>
      {removendo ? "removendo..." : "remover"}
    </button>
  );
}
