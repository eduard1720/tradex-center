"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { getAdminPw } from "@/lib/admin";

/* -------------------------------------------------------------------------- */
/*  Selector de miniatura reutilizable.                                        */
/*  Devuelve una URL (subida a Supabase o pegada a mano). Si queda vacía, se   */
/*  usa la miniatura automática (fallback) que se pasa como preview.           */
/* -------------------------------------------------------------------------- */

export function ImagePicker({
  value,
  onChange,
  fallback,
  label = "Miniatura",
}: {
  value: string;
  onChange: (url: string) => void;
  /** Miniatura automática que se mostrará si no hay una personalizada. */
  fallback?: string;
  label?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const preview = value || fallback || "";

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/thumbnails", {
        method: "POST",
        headers: { "x-admin-password": getAdminPw() ?? "" },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir la imagen.");
        return;
      }
      onChange(data.url as string);
    } catch {
      setLoading(false);
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex items-start gap-3">
        <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg border border-line bg-card-soft">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="miniatura" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-center text-[10px] text-muted">
              Se genera<br />automática
            </div>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              title="Quitar miniatura personalizada"
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-md bg-black/60 text-white hover:bg-black/80"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="btn-ghost w-full justify-center disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Subiendo...</>
            ) : (
              <><ImagePlus className="h-4 w-4" /> Subir imagen</>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFile}
            className="hidden"
          />
          <input
            className="input text-xs"
            placeholder="…o pega la URL de una imagen"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          {error && <p className="text-xs text-neg">{error}</p>}
          <p className="text-[11px] text-muted">
            Si lo dejas vacío, se usa la miniatura automática del video.
          </p>
        </div>
      </div>
    </div>
  );
}
