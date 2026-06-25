"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { isCompleted, setCompleted, onProgressChange } from "@/lib/progress";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiLoading = false;

function ensureYouTubeAPI(cb: () => void) {
  if (typeof window === "undefined") return;
  if (window.YT && window.YT.Player) {
    cb();
    return;
  }
  const prev = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    prev?.();
    cb();
  };
  if (!apiLoading) {
    apiLoading = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}

export function VideoPlayer({
  classId,
  provider,
  videoId,
  embedUrl,
  title,
  durationMin,
}: {
  classId: string;
  provider: "youtube" | "vimeo" | "unknown";
  videoId: string | null;
  embedUrl: string;
  title: string;
  durationMin: number;
}) {
  // Contenedor que React posee; el nodo del player de YouTube lo creamos y
  // destruimos nosotros para no chocar con el ciclo de vida de React.
  const wrapRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sync = () => setDone(isCompleted(classId));
    sync();
    return onProgressChange(sync);
  }, [classId]);

  useEffect(() => {
    const complete = () => setCompleted(classId, true);
    let player: any;
    let cancelled = false;

    if (provider === "youtube" && videoId && wrapRef.current) {
      const wrap = wrapRef.current;
      const mount = document.createElement("div");
      mount.style.position = "absolute";
      mount.style.inset = "0";
      mount.style.width = "100%";
      mount.style.height = "100%";
      wrap.appendChild(mount);

      ensureYouTubeAPI(() => {
        if (cancelled) return;
        player = new window.YT.Player(mount, {
          videoId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onStateChange: (e: any) => {
              if (e.data === 0) complete(); // 0 = ENDED
            },
          },
        });
      });
    }

    // Red de seguridad: tras la duración de la clase con la página abierta,
    // se considera vista (por si el evento "ended" no llega).
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (durationMin > 0) {
      timer = setTimeout(complete, durationMin * 60 * 1000);
    }

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      try {
        player?.destroy?.();
      } catch {
        /* noop */
      }
      if (wrapRef.current) wrapRef.current.innerHTML = "";
    };
  }, [classId, provider, videoId, durationMin]);

  return (
    <div className="space-y-2">
      <div className="card overflow-hidden p-0">
        <div className="relative aspect-video w-full bg-black">
          {provider === "youtube" && videoId ? (
            <div ref={wrapRef} className="absolute inset-0 h-full w-full" />
          ) : (
            <iframe
              src={embedUrl}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </div>

      <p className={`flex items-center gap-1.5 text-xs ${done ? "text-pos" : "text-muted"}`}>
        {done ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" /> Clase completada · siguiente desbloqueada
          </>
        ) : (
          <>
            <Eye className="h-3.5 w-3.5" /> Mira el video hasta el final para desbloquear la siguiente clase
          </>
        )}
      </p>
    </div>
  );
}
