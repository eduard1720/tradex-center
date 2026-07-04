"use client";

import { useEffect, useRef } from "react";

/* -------------------------------------------------------------------------- */
/*  Animación de entrada (public/motion.mp4).                                  */
/*  Se reproduce una sola vez tras iniciar sesión, justo antes de revelar la   */
/*  plataforma. Llama a onDone al terminar (o si el video falla / se demora).  */
/* -------------------------------------------------------------------------- */

export function IntroMotion({ onDone }: { onDone: () => void }) {
  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  };

  useEffect(() => {
    // Respaldo: si el video no dispara "ended" (error de formato, no carga…),
    // terminamos igual para no dejar al usuario atascado.
    const t = setTimeout(finish, 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black">
      <video
        className="h-full w-full object-contain"
        autoPlay
        muted
        playsInline
        onEnded={finish}
        onError={finish}
      >
        <source src="/motion.webm" type="video/webm" />
        <source src="/motion.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
