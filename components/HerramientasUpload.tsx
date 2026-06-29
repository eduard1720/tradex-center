"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Loader2, ShieldCheck } from "lucide-react";
import { useAdmin, getAdminPw } from "@/lib/admin";

export function HerramientasUpload() {
  const isAdmin = useAdmin();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  if (!isAdmin) return null;

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Selecciona un archivo.");
      return;
    }
    setStatus("loading");
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      fd.append("target", target);
      const res = await fetch("/api/herramientas", {
        method: "POST",
        headers: { "x-admin-password": getAdminPw() ?? "" },
        body: fd,
      });
      setStatus("idle");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo subir el archivo.");
        return;
      }
      setTitle("");
      setTarget("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch {
      setStatus("idle");
      setError("Error de red. Inténtalo de nuevo.");
    }
  }

  return (
    <form onSubmit={upload} className="card border-brand/30 p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold text-white">Modo Angel · Subir herramienta</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Título (opcional)</label>
          <input
            className="input"
            placeholder="Ej: Guía de gestión de riesgo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="label">¿Para qué módulo o lección? (opcional)</label>
          <input
            className="input"
            placeholder="Ej: Módulo 2 · Order blocks"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Archivo (PDF, PPT, libro, etc.)</label>
          <input
            ref={fileRef}
            type="file"
            className="input file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-3 file:py-1 file:text-brand"
          />
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-neg">{error}</p>}

      <button type="submit" disabled={status === "loading"} className="btn-primary mt-4 disabled:opacity-60">
        {status === "loading" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</>
        ) : (
          <><UploadCloud className="h-4 w-4" /> Subir archivo</>
        )}
      </button>
      <p className="mt-2 text-[11px] text-muted">Máximo 50 MB por archivo.</p>
    </form>
  );
}
