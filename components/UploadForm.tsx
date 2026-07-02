"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Youtube,
  Loader2,
  Lock,
  Layers,
  Plus,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { CATEGORIES, LEVELS } from "@/lib/types";
import { parseVideo } from "@/lib/video";
import { useAdmin, getAdminPw, loginAdmin, logoutAdmin } from "@/lib/admin";
import { ImagePicker } from "@/components/ImagePicker";

interface ModuleOption {
  module: number;
  title: string;
  thumbnail?: string;
}

const empty = {
  title: "",
  description: "",
  videoUrl: "",
  category: "",
  level: LEVELS[0] as string,
  instructor: "Angel Hurtado",
  tags: "",
  module: "1",
  moduleTitle: "",
  thumbnailCustom: "",
  moduleThumbnail: "",
};

export function UploadForm({ modules = [] }: { modules?: ModuleOption[] }) {
  const router = useRouter();
  const nextModule = useMemo(
    () => modules.reduce((m, x) => Math.max(m, x.module), 0) + 1,
    [modules]
  );
  const [form, setForm] = useState(() => ({ ...empty, module: String(nextModule) }));
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  // Asistente en 2 pasos: primero el módulo, luego la clase.
  const [step, setStep] = useState<"module" | "lesson">("module");
  const [modError, setModError] = useState("");

  // --- Puerta de administrador -------------------------------------------
  const isAdmin = useAdmin();
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const parsed = useMemo(() => parseVideo(form.videoUrl), [form.videoUrl]);
  const validVideo = parsed.provider !== "unknown";

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Paso 1 → paso 2: crea un módulo nuevo con el número y nombre indicados.
  function createModule(e: React.FormEvent) {
    e.preventDefault();
    if (!form.module.trim() || Number(form.module) <= 0) {
      setModError("Indica un número de módulo válido (1, 2, 3...).");
      return;
    }
    if (!form.moduleTitle.trim()) {
      setModError("Ponle un nombre al módulo.");
      return;
    }
    if (modules.some((m) => m.module === Number(form.module))) {
      setModError(`El módulo ${form.module} ya existe. Elígelo abajo para añadirle clases.`);
      return;
    }
    setModError("");
    setStep("lesson");
  }

  // Continúa hacia el paso 2 usando un módulo que ya existe.
  function useExistingModule(m: ModuleOption) {
    setForm((f) => ({
      ...f,
      module: String(m.module),
      moduleTitle: m.title,
      moduleThumbnail: m.thumbnail ?? "",
    }));
    setModError("");
    setStep("lesson");
  }

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

  // -------------------------- Paso 1: crear/elegir módulo -----------------
  if (step === "module") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="card space-y-5 p-6">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted">Paso 1 de 2</p>
              <h2 className="text-base font-semibold text-white">Crea un nuevo módulo</h2>
            </div>
          </div>

          <form onSubmit={createModule} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="label">N° de módulo</label>
                <input
                  type="number"
                  min={1}
                  className="input"
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
            <ImagePicker
              label="Miniatura del módulo (opcional)"
              value={form.moduleThumbnail}
              onChange={(url) => set("moduleThumbnail", url)}
            />
            {modError && <p className="text-xs text-neg">{modError}</p>}
            <button type="submit" className="btn-primary w-full">
              <Plus className="h-4 w-4" /> Crear módulo y continuar
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>

        {modules.length > 0 && (
          <div className="card space-y-3 p-6">
            <h3 className="text-sm font-semibold text-white">O añade una clase a un módulo existente</h3>
            <div className="flex flex-col gap-2">
              {modules.map((m) => (
                <button
                  key={m.module}
                  type="button"
                  onClick={() => useExistingModule(m)}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-card-soft/40 px-4 py-3 text-left transition-colors hover:border-white/15"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand text-sm font-bold text-black">
                    {m.module}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{m.title}</p>
                    <p className="text-[11px] text-muted">Módulo {m.module}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ------------------------------ Paso 2: subir la clase --------------------
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Main fields */}
      <div className="card space-y-5 p-6 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-white">Datos de la clase</h2>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            <Layers className="h-3.5 w-3.5" /> Módulo {form.module}
            {form.moduleTitle ? ` · ${form.moduleTitle}` : ""}
            <button
              type="button"
              onClick={() => setStep("module")}
              className="ml-1 inline-flex items-center gap-1 text-muted hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" /> Cambiar
            </button>
          </div>
        </div>

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

        <ImagePicker
          label="Miniatura de la clase (opcional)"
          value={form.thumbnailCustom}
          onChange={(url) => set("thumbnailCustom", url)}
          fallback={validVideo ? parsed.thumbnail : ""}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Categoría</label>
            <input
              className="input"
              list="categorias"
              placeholder="Escribe o elige una categoría"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
            />
            <datalist id="categorias">
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

      </div>

      {/* Summary / preview */}
      <div className="space-y-5">
        <div className="card p-5">
          <h2 className="mb-3 text-base font-semibold text-white">Vista previa</h2>
          <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-card-soft">
            {form.thumbnailCustom || (validVideo && parsed.thumbnail) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.thumbnailCustom || parsed.thumbnail}
                alt="preview"
                className="h-full w-full object-cover"
              />
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
            {form.category || "Categoría"} · {form.level}
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
