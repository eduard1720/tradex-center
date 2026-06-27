"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { useAdmin, getAdminPw } from "@/lib/admin";
import type { LiveSession } from "@/lib/live";

const empty = { title: "", startsAt: "", link: "" };

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("es-BO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LiveAdmin({ sessions }: { sessions: LiveSession[] }) {
  const isAdmin = useAdmin();
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");

  if (!isAdmin) return null;

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/en-vivo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": getAdminPw() ?? "",
        },
        body: JSON.stringify(form),
      });
      setStatus("idle");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo guardar la sesión.");
        return;
      }
      setForm(empty);
      router.refresh();
    } catch {
      setStatus("idle");
      setError("Error de red. Inténtalo de nuevo.");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("¿Eliminar esta clase en vivo?")) return;
    await fetch(`/api/en-vivo?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    router.refresh();
  }

  return (
    <div className="card border-brand/30 p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <h2 className="text-base font-semibold text-white">Modo Angel · Programar clase en vivo</h2>
      </div>

      <form onSubmit={add} className="space-y-4">
        <div>
          <label className="label">Título de la sesión</label>
          <input
            className="input"
            placeholder="Ej: Análisis semanal del mercado"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Fecha y hora</label>
            <input
              type="datetime-local"
              className="input"
              value={form.startsAt}
              onChange={(e) => set("startsAt", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Enlace (Zoom / YouTube / Meet) — opcional</label>
            <input
              className="input"
              placeholder="https://..."
              value={form.link}
              onChange={(e) => set("link", e.target.value)}
            />
          </div>
        </div>
        {error && <p className="text-xs text-neg">{error}</p>}
        <button type="submit" disabled={status === "loading"} className="btn-primary disabled:opacity-60">
          {status === "loading" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            <><CalendarPlus className="h-4 w-4" /> Programar sesión</>
          )}
        </button>
        <p className="text-[11px] text-muted">
          Tras programar o cambiar una clase, usa el botón <strong>“Avisar al grupo”</strong>
          {" "}(arriba, en la próxima sesión) para notificar a tus alumnos por WhatsApp.
        </p>
      </form>

      {sessions.length > 0 && (
        <div className="mt-6 border-t border-line pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted/70">
            Sesiones programadas
          </p>
          <ul className="divide-y divide-line">
            {sessions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{s.title}</p>
                  <p className="text-xs text-muted">{formatWhen(s.startsAt)}</p>
                </div>
                <button
                  onClick={() => remove(s.id)}
                  title="Eliminar"
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted hover:border-neg/40 hover:text-neg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
