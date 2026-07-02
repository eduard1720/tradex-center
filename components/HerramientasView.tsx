"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Download,
  Trash2,
  Lock,
  UploadCloud,
  Loader2,
  ShieldCheck,
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
import { useStudent } from "@/lib/student";
import { getCompleted, loadProgress, onProgressChange } from "@/lib/progress";

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

export interface ToolItem {
  id: number;
  title: string;
  kind: string;
  url: string;
  target: string;
  classId: string;
  className: string;
}

export function HerramientasView({ items }: { items: ToolItem[] }) {
  const isAdmin = useAdmin();
  const student = useStudent();
  const router = useRouter();
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (student) loadProgress();
    setCompleted(getCompleted());
    return onProgressChange(() => setCompleted(getCompleted()));
  }, [student]);

  // Angel ve todo. El alumno ve el material general (sin clase) y el de las
  // lecciones que ya completó (hasta donde ha avanzado).
  const visible = isAdmin
    ? items
    : items.filter((it) => !it.classId || completed.has(it.classId));
  const lockedCount = isAdmin ? 0 : items.length - visible.length;

  async function remove(id: number) {
    if (!window.confirm("¿Eliminar este archivo?")) return;
    await fetch(`/api/herramientas?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Subida de material general (no ligado a ninguna lección) — solo Angel. */}
      {isAdmin && <AdminUpload onDone={() => router.refresh()} />}

      {items.length === 0 ? (
        <div className="card grid place-items-center py-16 text-center">
          <p className="text-muted">
            {isAdmin
              ? "Aún no has publicado material general. Súbelo desde el recuadro de arriba."
              : "Aún no hay material publicado."}
          </p>
        </div>
      ) : visible.length === 0 ? (
        <div className="card grid place-items-center py-16 text-center">
          <p className="text-muted">
            Todavía no tienes material disponible. Avanza en tus clases para desbloquear los recursos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => {
            const meta = KIND[r.kind] ?? KIND.file;
            const Icon = meta.icon;
            return (
              <div key={r.id} className="card flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => remove(r.id)}
                      title="Eliminar"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted hover:border-neg/40 hover:text-neg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-white">{r.title}</h3>
                <p className="mt-1 text-xs text-muted">{meta.label}</p>
                {(r.className || r.target) && (
                  <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-medium text-brand">
                    {r.className || r.target}
                  </span>
                )}
                {r.classId ? (
                  <Link href={`/clases/${r.classId}`} className="mt-1 text-[11px] text-muted hover:text-white">
                    Ir a la lección
                  </Link>
                ) : null}
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost mt-4 justify-center"
                >
                  <Download className="h-4 w-4" /> Abrir / Descargar
                </a>
              </div>
            );
          })}
        </div>
      )}

      {lockedCount > 0 && (
        <p className="inline-flex items-center gap-1.5 text-xs text-muted">
          <Lock className="h-3.5 w-3.5" />
          {lockedCount} recurso{lockedCount === 1 ? "" : "s"} más se desbloquea
          {lockedCount === 1 ? "" : "n"} a medida que avances en las clases.
        </p>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Subida de material general (sin lección). Se guarda sin classId, así que  */
/*  todos los alumnos lo ven en Herramientas independientemente de su avance. */
/* -------------------------------------------------------------------------- */

function AdminUpload({ onDone }: { onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

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
      // Sin classId: es material general de la comunidad, no de una lección.
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
      onDone();
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
        <div>
          <h2 className="text-base font-semibold text-white">Modo Angel · Subir material general</h2>
          <p className="text-[11px] text-muted">
            Recursos para toda la comunidad, sin relación con una lección concreta.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Título (opcional)</label>
          <input
            className="input"
            placeholder="Ej: Calendario económico 2026"
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
