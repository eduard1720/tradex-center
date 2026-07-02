"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  UploadCloud,
  Loader2,
  Trash2,
  X,
  FileText,
  Presentation,
  BookOpen,
  Sheet,
  Image as ImageIcon,
  FileArchive,
  File,
  type LucideIcon,
} from "lucide-react";
import { useAdmin, getAdminPw } from "@/lib/admin";
import type { Resource } from "@/lib/resources";

const KIND: Record<string, { icon: LucideIcon; label: string }> = {
  pdf: { icon: FileText, label: "PDF" },
  slides: { icon: Presentation, label: "Diapositivas" },
  doc: { icon: FileText, label: "Documento" },
  book: { icon: BookOpen, label: "Libro" },
  sheet: { icon: Sheet, label: "Hoja de cálculo" },
  image: { icon: ImageIcon, label: "Imagen" },
  zip: { icon: FileArchive, label: "Comprimido" },
  file: { icon: File, label: "Archivo" },
};

function ResourceRow({ r, isAdmin, onDelete }: { r: Resource; isAdmin: boolean; onDelete: (id: number) => void }) {
  const meta = KIND[r.kind] ?? KIND.file;
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-card-soft px-3 py-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{r.title}</p>
        <p className="text-[11px] text-muted">{meta.label}</p>
      </div>
      <a
        href={r.url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-ghost shrink-0 px-3 py-1.5 text-xs"
      >
        <Download className="h-3.5 w-3.5" /> Descargar
      </a>
      {isAdmin && (
        <button
          onClick={() => onDelete(r.id)}
          title="Eliminar"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted hover:border-neg/40 hover:text-neg"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function LessonResources({
  classId,
  target,
  resources,
}: {
  classId: string;
  target: string;
  resources: Resource[];
}) {
  const isAdmin = useAdmin();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  // Alumno: el botón solo aparece si esta lección tiene material.
  if (!isAdmin && resources.length === 0) return null;

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
      fd.append("classId", classId);
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
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } catch {
      setStatus("idle");
      setError("Error de red. Inténtalo de nuevo.");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("¿Eliminar este archivo?")) return;
    await fetch(`/api/herramientas?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    router.refresh();
  }

  return (
    <div className="mt-5 flex items-center gap-3 border-t border-line pt-5">
      <button className="btn-ghost" onClick={() => setOpen(true)}>
        {isAdmin ? <UploadCloud className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        Recursos de la clase
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl border border-line bg-bg-soft p-6 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-white"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>

            <h2 className="text-base font-semibold text-white">Recursos de la clase</h2>
            <p className="mt-1 text-xs text-muted">{target}</p>

            {/* Lista de material */}
            {resources.length > 0 ? (
              <div className="mt-4 flex max-h-64 flex-col gap-2 overflow-y-auto">
                {resources.map((r) => (
                  <ResourceRow key={r.id} r={r} isAdmin={isAdmin} onDelete={remove} />
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted">
                {isAdmin
                  ? "Aún no has subido material para esta lección."
                  : "Esta lección todavía no tiene material de apoyo."}
              </p>
            )}

            {/* Subida directa desde la lección (solo Angel) */}
            {isAdmin && (
              <form onSubmit={upload} className="mt-5 rounded-xl border border-brand/30 bg-brand-soft/30 p-4">
                <p className="mb-3 text-xs font-medium text-brand">Modo Angel · Subir recurso a esta lección</p>
                <div className="mb-3">
                  <label className="label">Título (opcional)</label>
                  <input
                    className="input"
                    placeholder="Ej: Guía en PDF de esta clase"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label">Archivo (PDF, PPT, libro, etc.)</label>
                  <input
                    ref={fileRef}
                    type="file"
                    className="input file:mr-3 file:rounded-md file:border-0 file:bg-brand-soft file:px-3 file:py-1 file:text-brand"
                  />
                </div>
                {error && <p className="mt-2 text-xs text-neg">{error}</p>}
                <button type="submit" disabled={status === "loading"} className="btn-primary mt-3 disabled:opacity-60">
                  {status === "loading" ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</>
                  ) : (
                    <><UploadCloud className="h-4 w-4" /> Subir recurso</>
                  )}
                </button>
                <p className="mt-2 text-[11px] text-muted">Máximo 50 MB por archivo.</p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
