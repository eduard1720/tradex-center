"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { getAdminPw } from "@/lib/admin";
import { ImagePicker } from "@/components/ImagePicker";

export function ModuleThumbnailModal({
  module,
  title,
  current,
  fallback,
  onClose,
  onSaved,
}: {
  module: number;
  title: string;
  current: string;
  fallback: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [url, setUrl] = useState(current);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  async function save() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/modulos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-password": getAdminPw() ?? "" },
        body: JSON.stringify({ module, thumbnail: url }),
      });
      setStatus("idle");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo guardar.");
        return;
      }
      onSaved();
    } catch {
      setStatus("idle");
      setError("Error de red. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-bg/80 p-4 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Miniatura del módulo</h2>
          <button onClick={onClose} className="text-muted hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-xs text-muted">
          Módulo {module} · {title}
        </p>

        <ImagePicker label="Imagen del módulo" value={url} onChange={setUrl} fallback={fallback} />

        {error && <p className="mt-2 text-xs text-neg">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">
            Cancelar
          </button>
          <button onClick={save} disabled={status === "loading"} className="btn-primary disabled:opacity-60">
            {status === "loading" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
            ) : (
              <><Save className="h-4 w-4" /> Guardar</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
