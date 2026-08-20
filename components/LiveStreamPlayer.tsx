"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { getStudentCode } from "@/lib/student";
import { getAdminPw } from "@/lib/admin";

/**
 * Reproductor de la transmisión en vivo. Pide el enlace embebible a
 * /api/live/current recién montado en el cliente (nunca vía props del
 * Server Component) para que el enlace de YouTube solo viaje a sesiones
 * autenticadas, no en el HTML inicial de la página.
 */
export function LiveStreamPlayer({ isLive, title }: { isLive: boolean; title: string }) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLive) {
      setEmbedUrl(null);
      return;
    }
    let cancelled = false;
    const headers: Record<string, string> = {};
    const code = getStudentCode();
    const pw = getAdminPw();
    if (pw) headers["x-admin-password"] = pw;
    else if (code) headers["x-student-code"] = code;

    fetch("/api/live/current", { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled) setEmbedUrl(d?.embedUrl ?? null);
      })
      .catch(() => {
        if (!cancelled) setEmbedUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [isLive]);

  if (!isLive || !embedUrl) return null;

  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-line bg-neg/10 px-4 py-2.5">
        <Radio className="h-4 w-4 animate-pulse text-neg" />
        <span className="text-sm font-medium text-white">{title} · En vivo ahora</span>
      </div>
      <div className="aspect-video w-full bg-black">
        <iframe
          src={embedUrl}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
