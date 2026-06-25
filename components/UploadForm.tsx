"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Upload, CheckCircle2, AlertCircle, Youtube, Loader2, Lock } from "lucide-react";
import { CATEGORIES, LEVELS } from "@/lib/types";
import { parseVideo } from "@/lib/video";
import { useAdmin, getAdminPw, loginAdmin, logoutAdmin } from "@/lib/admin";

const empty = {
  title: "",
  description: "",
  videoUrl: "",
  category: CATEGORIES[0] as string,
  level: LEVELS[0] as string,
  instructor: "Angel Hurtado",
  durationMin: "",
  tags: "",
  module: "1",
  moduleTitle: "",
};

export function UploadForm() {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  // --- Puerta de administrador -------------------------------------------
  const isAdmin = useAdmin();
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const parsed = useMemo(() => parseVideo(form.videoUrl), [form.videoUrl]);
  const validVideo = parsed.provider !== "unknown";

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/clases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": getAdminPw() ?? "",
        },
        body: JSON.stringify({
          ...form,
          durationMin: Number(form.durationMin),
          module: Number(form.module),
        }),
      });
      const data = await res.json();
      if (res.status === 401) {
        // Sesión inválida: vuelve a pedir acceso.
        logoutAdmin();
        setStatus("idle");
        setMessage("");
        return;
      }
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "No se pudo guardar la clase.");
        return;
      }
      setStatus("ok");
      setMessage("¡Clase publicada con éxito!");
      setTimeout(() => router.push(`/clases/${data.class.id}`), 900);
      router.refresh();
    } catch {
      setStatus("error");
      setMessage("Error de red. Inténtalo de nuevo.");
    }
  }

  // Si no hay sesión de administrador, muestra la pantalla de acceso.
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card space-y-4 p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
            <Lock className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Acceso de administrador</h2>
            <p className="mt-1 text-sm text-muted">
              Solo Angel puede subir clases. Ingresa la clave de administrador.
            </p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!pwInput.trim()) return;
              setPwLoading(true);
              setPwError(false);
              const ok = await loginAdmin(pwInput.trim());
              setPwLoading(false);
              if (ok) {
                setPwInput("");
                router.refresh();
              } else {
                setPwError(true);
              }
            }}
            className="space-y-3"
          >
            <input
              type="password"
              autoFocus
              className={`input text-center ${pwError ? "border-neg" : ""}`}
              placeholder="Clave de administrador"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
            />
            {pwError && <p className="text-xs text-neg">Clave incorrecta.</p>}
            <button type="submit" disabled={pwLoading} className="btn-primary w-full disabled:opacity-60">
              <Lock className="h-4 w-4" /> {pwLoading ? "Verificando..." : "Entrar"}
            </button>
          </form>
          <p className="text-[11px] text-muted">
            La clave se configura en la variable de entorno <code>ADMIN_PASSWORD</code>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Main fields */}
      <div className="card space-y-5 p-6 lg:col-span-2">
        <h2 className="text-base font-semibold text-white">Datos de la clase</h2>

        <div>
          <label className="label">Título de la clase</label>
          <input
            className="input"
            placeholder="Ej: Cómo identificar order blocks institucionales"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea
            className="input min-h-[110px] resize-y"
            placeholder="Qué aprenderá el estudiante en esta clase..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <Youtube className="h-3.5 w-3.5" /> Link del video (YouTube o Vimeo)
          </label>
          <input
            className="input"
            placeholder="https://www.youtube.com/watch?v=..."
            value={form.videoUrl}
            onChange={(e) => set("videoUrl", e.target.value)}
          />
          {form.videoUrl && (
            <p
              className={`mt-1.5 text-xs ${validVideo ? "text-pos" : "text-neg"}`}
            >
              {validVideo
                ? `✓ Detectado: ${parsed.provider === "youtube" ? "YouTube" : "Vimeo"}`
                : "Link no reconocido. Usa un enlace de YouTube o Vimeo."}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Categoría</label>
            <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Nivel</label>
            <select className="input" value={form.level} onChange={(e) => set("level", e.target.value)}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Duración (min)</label>
            <input
              type="number"
              min={1}
              className="input"
              placeholder="35"
              value={form.durationMin}
              onChange={(e) => set("durationMin", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Instructor</label>
            <input className="input" value={form.instructor} onChange={(e) => set("instructor", e.target.value)} />
          </div>
          <div>
            <label className="label">Etiquetas (separadas por comas)</label>
            <input className="input" placeholder="velas, soportes, btc" value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </div>
        </div>

        <div className="rounded-xl border border-line bg-card-soft/40 p-4">
          <p className="mb-3 text-sm font-medium text-white">Módulo del curso</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="label">N° de módulo</label>
              <input
                type="number"
                min={0}
                className="input"
                placeholder="1"
                value={form.module}
                onChange={(e) => set("module", e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Nombre del módulo</label>
              <input
                className="input"
                placeholder="Ej: Fundamentos del Trading"
                value={form.moduleTitle}
                onChange={(e) => set("moduleTitle", e.target.value)}
              />
            </div>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Usa <strong>módulo 0</strong> para clases en vivo (no entran en la ruta de módulos).
            El orden dentro del módulo se asigna automáticamente.
          </p>
        </div>
      </div>

      {/* Summary / preview */}
      <div className="space-y-5">
        <div className="card p-5">
          <h2 className="mb-3 text-base font-semibold text-white">Vista previa</h2>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-card-soft">
            {validVideo && parsed.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={parsed.thumbnail} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-center text-xs text-muted">
                La miniatura aparecerá<br />al pegar un link válido
              </div>
            )}
          </div>
          <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-white">
            {form.title || "Título de tu clase"}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {form.category} · {form.level} · {form.durationMin || "0"} min
          </p>
        </div>

        <div className="card p-5">
          <h2 className="mb-3 text-base font-semibold text-white">Resumen</h2>
          <dl className="space-y-2.5 text-sm">
            <Row k="Instructor" v={form.instructor} />
            <Row k="Categoría" v={form.category} />
            <Row k="Nivel" v={form.level} />
            <Row k="Video" v={validVideo ? (parsed.provider === "youtube" ? "YouTube" : "Vimeo") : "—"} />
          </dl>

          {status !== "idle" && status !== "loading" && (
            <div
              className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs ${
                status === "ok"
                  ? "border-pos/30 bg-pos/10 text-pos"
                  : "border-neg/30 bg-neg/10 text-neg"
              }`}
            >
              {status === "ok" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-primary mt-4 w-full disabled:opacity-60"
          >
            {status === "loading" ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</>
            ) : (
              <><Upload className="h-4 w-4" /> Publicar clase</>
            )}
          </button>
          <p className="mt-2 text-center text-[11px] text-muted">
            La clase será visible para todos tus estudiantes.
          </p>
        </div>
      </div>
    </form>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted">{k}</dt>
      <dd className="truncate font-medium text-white">{v || "—"}</dd>
    </div>
  );
}
