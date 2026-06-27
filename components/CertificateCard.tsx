"use client";

import { useEffect, useState } from "react";
import { Award, Lock } from "lucide-react";
import { getCompleted, onProgressChange } from "@/lib/progress";

/**
 * Tarjeta de certificado. Se desbloquea cuando el alumno completa todas las
 * clases del curso. El certificado en sí lo entregará Angel más adelante.
 */
export function CertificateCard({ totalLessons }: { totalLessons: number }) {
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const sync = () => setDoneCount(getCompleted().size);
    sync();
    return onProgressChange(sync);
  }, []);

  const complete = totalLessons > 0 && doneCount >= totalLessons;

  return (
    <div
      className={`card relative overflow-hidden p-6 ${
        complete ? "border-brand/40" : ""
      }`}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/15 blur-3xl" />
      <div className="flex items-center gap-3">
        <span
          className={`grid h-12 w-12 place-items-center rounded-2xl ${
            complete ? "bg-brand text-black" : "bg-card-soft text-muted"
          }`}
        >
          {complete ? <Award className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">Certificado del curso</h2>
          <p className="text-xs text-muted">
            {totalLessons > 0 ? `${doneCount}/${totalLessons} clases completadas` : "Curso en preparación"}
          </p>
        </div>
      </div>

      {complete ? (
        <div className="mt-4">
          <p className="text-sm text-white/90">
            🎉 ¡Felicidades! Completaste todas las clases. Angel habilitará tu certificado y te lo
            entregará pronto.
          </p>
          <button
            disabled
            className="btn-primary mt-4 cursor-not-allowed opacity-60"
            title="Disponible próximamente"
          >
            <Award className="h-4 w-4" /> Certificado (próximamente)
          </button>
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted">
          Completa todas las clases del curso para desbloquear tu certificado.
        </p>
      )}
    </div>
  );
}
