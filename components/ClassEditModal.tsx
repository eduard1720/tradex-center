"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { CATEGORIES, LEVELS, type TradingClass } from "@/lib/types";
import { getAdminPw } from "@/lib/admin";

export function ClassEditModal({
  cls,
  onClose,
  onSaved,
}: {
  cls: TradingClass;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: cls.title,
    description: cls.description,
    videoUrl: cls.videoUrl,
    category: cls.category as string,
    level: cls.level as string,
    module: String(cls.module),
    moduleTitle: cls.moduleTitle,
    tags: cls.tags.join(", "),
  });
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/clases?id=${encodeURIComponent(cls.id)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": getAdminPw() ?? "",
        },
        body: JSON.stringify({
          ...form,
          module: Number(form.module),
        }),
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
      <div className="card w-full max-w-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-white">Editar clase</h2>
          <button onClick={onClose} className="text-muted hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={save} className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div>
            <label className="label">Título</label>
            <input className="input" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input min-h-[80px] resize-y"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Link del video</label>
            <input className="input" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Categoría</label>
              <input
                className="input"
                list="categorias-edit"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
              <datalist id="categorias-edit">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="label">Nivel</label>
              <select className="input" value={form.level} onChange={(e) => set("level", e.target.value)}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">N° módulo</label>
              <input
                type="number"
                min={0}
                className="input"
                value={form.module}
                onChange={(e) => set("module", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Nombre del módulo</label>
              <input className="input" value={form.moduleTitle} onChange={(e) => set("moduleTitle", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Etiquetas (separadas por comas)</label>
            <input className="input" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </div>

          {error && <p className="text-xs text-neg">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancelar
            </button>
            <button type="submit" disabled={status === "loading"} className="btn-primary disabled:opacity-60">
              {status === "loading" ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
              ) : (
                <><Save className="h-4 w-4" /> Guardar cambios</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
