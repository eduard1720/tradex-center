"use client";

import { useEffect, useRef, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Fondo en video (bucle) detrás de todo el contenido.                       */
/*  Muteado + autoplay + loop + playsInline para que reproduzca solo.         */
/*  Con prefers-reduced-motion muestra la imagen estática (poster).           */
/* -------------------------------------------------------------------------- */

export function VideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduce) return;

    // Algunos navegadores no respetan el atributo autoPlay: forzamos play().
    const tryPlay = () => {
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    // Si la pestaña vuelve a estar visible, reanuda.
    const onVisible = () => {
      if (document.visibilityState === "visible") tryPlay();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      v.removeEventListener("canplay", tryPlay);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reduce]);

  return (
    <div aria-hidden className="bg-media">
      {reduce ? (
        <div
          className="bg-media__layer"
          style={{ backgroundImage: "url(/oficialvideo-poster.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        />
      ) : (
        <video
          ref={videoRef}
          className="bg-media__layer"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/oficialvideo-poster.jpg"
        >
          <source src="/oficialvideo.mp4" type="video/mp4" />
        </video>
      )}
      <div className="bg-media__veil" />
    </div>
  );
}
