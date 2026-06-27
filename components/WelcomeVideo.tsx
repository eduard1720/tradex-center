"use client";

import { useMemo, useState } from "react";
import { PlayCircle, Pencil, Loader2, Check, X, Youtube } from "lucide-react";
import { parseVideo } from "@/lib/video";
import { useAdmin, getAdminPw } from "@/lib/admin";

export function WelcomeVideo({ initialUrl }: { initialUrl: string }) {
  const isAdmin = useAdmin();
  const [url, setUrl] = useState(initialUrl);
  const [editing, setEditing] = useState(false);

  const parsed = useMemo(() => parseVideo(url), [url]);
  const hasVideo = parsed.provider !== "unknown" && Boolean(url);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-line bg-black">
        {hasVideo ? (
          <iframe
            src={parsed.embedUrl}
            title="Video de bienvenida"
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-card-soft to-bg text-center">
            <div className="px-6">
              <PlayCircle className="mx-auto h-12 w-12 text-muted" />
              <p className="mt-3 text-sm text-muted">
                {isAdmin
                  ? "Aún no has cargado tu video de bienvenida. Pulsa “Editar” y pega el enlace."
                  : "Angel subirá pronto su video de bienvenida."}
              </p>
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-ghost">
              <Pencil className="h-4 w-4" /> Editar video de bienvenida
            </button>
          ) : (
            <Editor
              initial={url}
              onCancel={() => setEditing(false)}
              onSaved={(v) => {
                setUrl(v);
                setEditing(false);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Editor({
  initial,
  onCancel,
  onSaved,
}: {
  initial: string;
  onCancel: () => void;
  onSaved: (url: string) => void;
}) {
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState("");
  const parsed = useMemo(() => parseVideo(value), [value]);
  const valid = !value || parsed.provider !== "unknown";

  async function save() {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": getAdminPw() ?? "",
        },
        body: JSON.stringify({ key: "welcome_video", value: value.trim() }),
      });
      setStatus("idle");
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo guardar.");
        return;
      }
      onSaved(value.trim());
    } catch {
      setStatus("idle");
      setError("Error de red. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="card space-y-3 p-4">
      <label className="label flex items-center gap-1.5">
        <Youtube className="h-3.5 w-3.5" /> Enlace del video (YouTube o Vimeo)
      </label>
      <input
        className="input"
        placeholder="https://www.youtube.com/watch?v=..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      {value && !valid && (
        <p className="text-xs text-neg">Link no reconocido. Usa YouTube o Vimeo.</p>
      )}
      {error && <p className="text-xs text-neg">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={status === "loading" || !valid}
          className="btn-primary disabled:opacity-60"
        >
          {status === "loading" ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            <><Check className="h-4 w-4" /> Guardar</>
          )}
        </button>
        <button onClick={onCancel} className="btn-ghost">
          <X className="h-4 w-4" /> Cancelar
        </button>
      </div>
    </div>
  );
}
