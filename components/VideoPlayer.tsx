"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { isCompleted, setCompleted, onProgressChange } from "@/lib/progress";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
    Vimeo?: any;
  }
}

/* --- Carga perezosa de las APIs de reproductor --------------------------- */

let ytLoading = false;
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
  if (!ytLoading) {
    ytLoading = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}

let vimeoLoading = false;
let vimeoReadyCbs: (() => void)[] = [];
function ensureVimeoAPI(cb: () => void) {
  if (typeof window === "undefined") return;
  if (window.Vimeo && window.Vimeo.Player) {
    cb();
    return;
  }
  vimeoReadyCbs.push(cb);
  if (vimeoLoading) return;
  vimeoLoading = true;
  const tag = document.createElement("script");
  tag.src = "https://player.vimeo.com/api/player.js";
  tag.onload = () => {
    const cbs = vimeoReadyCbs;
    vimeoReadyCbs = [];
    cbs.forEach((f) => f());
  };
  document.head.appendChild(tag);
}

/**
 * Reproductor de clase. El progreso es 100% automático: cuando el alumno
 * termina de ver el video (evento "ended" de YouTube o Vimeo) la clase se
 * marca como completada y se desbloquea la siguiente. No hay botón manual.
 */
export function VideoPlayer({
  classId,
  provider,
  videoId,
  embedUrl,
  title,
}: {
  classId: string;
  provider: "youtube" | "vimeo" | "unknown";
  videoId: string | null;
  embedUrl: string;
  title: string;
}) {
  // Contenedor que React posee; el nodo del player de YouTube lo creamos y
  // destruimos nosotros para no chocar con el ciclo de vida de React.
  const wrapRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const sync = () => setDone(isCompleted(classId));
    sync();
    return onProgressChange(sync);
  }, [classId]);

  useEffect(() => {
    const complete = () => setCompleted(classId, true);
    let ytPlayer: any;
    let vimeoPlayer: any;
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
        ytPlayer = new window.YT.Player(mount, {
          videoId,
          playerVars: { rel: 0, modestbranding: 1 },
          events: {
            onStateChange: (e: any) => {
              if (e.data === 0) complete(); // 0 = ENDED
            },
          },
        });
      });
    } else if (provider === "vimeo" && iframeRef.current) {
      const iframe = iframeRef.current;
      ensureVimeoAPI(() => {
        if (cancelled || !iframe) return;
        try {
          vimeoPlayer = new window.Vimeo.Player(iframe);
          vimeoPlayer.on("ended", complete);
        } catch {
          /* noop */
        }
      });
    }

    return () => {
      cancelled = true;
      try {
        ytPlayer?.destroy?.();
      } catch {
        /* noop */
      }
      try {
        // En Vimeo el iframe lo renderiza React: solo quitamos el listener.
        vimeoPlayer?.off?.("ended");
      } catch {
        /* noop */
      }
      if (wrapRef.current) wrapRef.current.innerHTML = "";
    };
  }, [classId, provider, videoId, embedUrl]);

  return (
    <div className="space-y-2">
      <div className="card overflow-hidden p-0">
        <div className="relative aspect-video w-full bg-black">
          {provider === "youtube" && videoId ? (
            <div ref={wrapRef} className="absolute inset-0 h-full w-full" />
          ) : (
            <iframe
              ref={iframeRef}
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
            <Circle className="h-3.5 w-3.5" /> La siguiente clase se desbloquea sola al terminar el
            video
          </>
        )}
      </p>
    </div>
  );
}
