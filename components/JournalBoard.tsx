"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  ImagePlus,
  X,
  LineChart,
} from "lucide-react";
import { useStudent, getStudentCode } from "@/lib/student";
import type { JournalEntry, Direction, Outcome } from "@/lib/journal";

const OUTCOME_META: Record<Outcome, { label: string; cls: string }> = {
  win: { label: "Ganadora", cls: "bg-pos/10 text-pos" },
  loss: { label: "Perdedora", cls: "bg-neg/10 text-neg" },
  be: { label: "Break-even", cls: "bg-card-soft text-muted" },
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  date: today(),
  asset: "",
  direction: "long" as Direction,
  outcome: "be" as Outcome,
  riskReward: "",
  notes: "",
  chartImage: "",
};

export function JournalBoard() {
  const student = useStudent();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingChart, setUploadingChart] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function pasteChart(e: React.ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(e.clipboardData?.items ?? []).find((i) => i.type.startsWith("image/"));
    if (!item) return;
    e.preventDefault();
    const file = item.getAsFile();
    if (!file) return;
    setUploadingChart(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/journal/chart", {
        method: "POST",
        headers: { "x-student-code": getStudentCode() ?? "" },
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la imagen.");
        return;
      }
      set("chartImage", data.url);
    } catch {
      setError("Error de red al subir la imagen.");
    } finally {
      setUploadingChart(false);
    }
  }

  const load = useCallback(async () => {
    const res = await fetch("/api/journal", {
      cache: "no-store",
      headers: { "x-student-code": getStudentCode() ?? "" },
    });
    const data = await res.json().catch(() => ({ entries: [] }));
    setEntries(data.entries ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (student) load();
    else setLoading(false);
  }, [student, load]);

  const stats = useMemo(() => {
    const total = entries.length;
    const wins = entries.filter((e) => e.outcome === "win").length;
    const losses = entries.filter((e) => e.outcome === "loss").length;
    const decided = wins + losses;
    const winRate = decided ? Math.round((wins / decided) * 100) : 0;
    return { total, wins, losses, winRate };
  }, [entries]);

  if (!student) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card space-y-2 p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
            <Lock className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold text-white">Inicia sesión</h2>
          <p className="text-sm text-muted">El journal de trading está disponible para alumnos.</p>
        </div>
      </div>
    );
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.asset.trim()) {
      setError("Indica el activo o par.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-student-code": getStudentCode() ?? "" },
        body: JSON.stringify(form),
      });
      setSaving(false);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo guardar.");
        return;
      }
      setForm({ ...emptyForm, date: form.date });
      load();
    } catch {
      setSaving(false);
      setError("Error de red. Inténtalo de nuevo.");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("¿Eliminar esta operación?")) return;
    await fetch(`/api/journal?id=${id}`, {
      method: "DELETE",
      headers: { "x-student-code": getStudentCode() ?? "" },
    });
    load();
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-xs text-muted">Operaciones</p>
          <p className="mt-1 text-2xl font-semibold text-white">{stats.total}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Win rate</p>
          <p className="mt-1 text-2xl font-semibold text-white">{stats.winRate}%</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-muted">Ganadoras / Perdedoras</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            <span className="text-pos">{stats.wins}</span>
            <span className="text-muted"> / </span>
            <span className="text-neg">{stats.losses}</span>
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={add} className="card space-y-4 p-5">
        <h2 className="text-base font-semibold text-white">Registrar operación</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label">Fecha</label>
            <input type="date" className="input" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            <label className="label">Activo / Par</label>
            <input
              className="input"
              placeholder="EUR/USD, BTC..."
              value={form.asset}
              onChange={(e) => set("asset", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Dirección</label>
            <select className="input" value={form.direction} onChange={(e) => set("direction", e.target.value)}>
              <option value="long">Long (compra)</option>
              <option value="short">Short (venta)</option>
            </select>
          </div>
          <div>
            <label className="label">Resultado</label>
            <select className="input" value={form.outcome} onChange={(e) => set("outcome", e.target.value)}>
              <option value="win">Ganadora</option>
              <option value="loss">Perdedora</option>
              <option value="be">Break-even</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="label">R:R</label>
            <input
              className="input"
              placeholder="1:2"
              value={form.riskReward}
              onChange={(e) => set("riskReward", e.target.value)}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="label">Notas</label>
            <input
              className="input"
              placeholder="Setup, emociones, qué aprendiste..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label">Gráfica</label>
          {form.chartImage ? (
            <div className="relative inline-block">
              <img
                src={form.chartImage}
                alt="Captura del gráfico"
                className="h-28 w-auto rounded-lg border border-line object-cover"
              />
              <button
                type="button"
                onClick={() => set("chartImage", "")}
                title="Quitar imagen"
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-line bg-bg text-muted hover:text-neg"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div
              tabIndex={0}
              onPaste={pasteChart}
              className="flex h-20 cursor-text items-center gap-2 rounded-xl border border-dashed border-line bg-card-soft/60 px-4 text-sm text-muted outline-none focus:border-brand/60"
            >
              {uploadingChart ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Subiendo captura...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" />
                  En TradingView, presiona <kbd className="rounded border border-line bg-bg px-1.5 py-0.5 text-[11px]">Alt</kbd>
                  +
                  <kbd className="rounded border border-line bg-bg px-1.5 py-0.5 text-[11px]">S</kbd>
                  , haz clic aquí y pega con Ctrl+V
                </>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-neg">{error}</p>}
        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            <><Plus className="h-4 w-4" /> Añadir operación</>
          )}
        </button>
      </form>

      {/* Lista */}
      {loading ? (
        <div className="card grid place-items-center py-12 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <div className="card grid place-items-center py-12 text-center text-muted">
          Aún no has registrado operaciones. Empieza con la de hoy 👆
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-3 py-3 font-medium">Activo</th>
                  <th className="px-3 py-3 font-medium">Dirección</th>
                  <th className="px-3 py-3 font-medium">Resultado</th>
                  <th className="px-3 py-3 font-medium">R:R</th>
                  <th className="px-3 py-3 font-medium">Notas</th>
                  <th className="px-3 py-3 font-medium">Gráfica</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-line align-top hover:bg-card-hover/50">
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted">{e.date}</td>
                    <td className="px-3 py-3.5 font-medium text-white">{e.asset}</td>
                    <td className="px-3 py-3.5">
                      {e.direction === "long" ? (
                        <span className="inline-flex items-center gap-1 text-pos">
                          <TrendingUp className="h-3.5 w-3.5" /> Long
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-neg">
                          <TrendingDown className="h-3.5 w-3.5" /> Short
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] ${OUTCOME_META[e.outcome].cls}`}>
                        {OUTCOME_META[e.outcome].label}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-muted">
                      {e.riskReward || <Minus className="h-3.5 w-3.5" />}
                    </td>
                    <td className="max-w-[260px] px-3 py-3.5 text-muted">{e.notes}</td>
                    <td className="px-3 py-3.5">
                      {e.chartImage ? (
                        <button
                          type="button"
                          onClick={() => setLightbox(e.chartImage)}
                          title="Ver gráfica"
                          className="grid h-10 w-14 place-items-center overflow-hidden rounded-lg border border-line hover:border-brand/60"
                        >
                          <img src={e.chartImage} alt="" className="h-full w-full object-cover" />
                        </button>
                      ) : (
                        <span className="grid h-10 w-14 place-items-center rounded-lg border border-dashed border-line text-muted">
                          <LineChart className="h-4 w-4" />
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => remove(e.id)}
                        title="Eliminar"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:border-neg/40 hover:text-neg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 grid cursor-zoom-out place-items-center bg-black/80 p-6"
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-line bg-bg-soft text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightbox}
            alt="Gráfica de la operación"
            className="max-h-[85vh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
