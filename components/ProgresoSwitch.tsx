"use client";

import { useAdmin } from "@/lib/admin";
import { ProgressView, type ProgressModule } from "@/components/ProgressView";
import { StudentsProgress } from "@/components/StudentsProgress";

/**
 * Elige la vista de /progreso según el rol:
 *  - Angel (admin) ve el avance de todos sus alumnos.
 *  - El alumno ve su propio progreso.
 */
export function ProgresoSwitch({ modules }: { modules: ProgressModule[] }) {
  const isAdmin = useAdmin();

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {isAdmin ? "Progreso de alumnos" : "Mi progreso"}
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          {isAdmin
            ? "El avance de cada alumno en el curso, calculado con las clases que han completado."
            : "Tu avance se guarda en tu cuenta: completa las clases y míralo reflejado aquí desde cualquier dispositivo."}
        </p>
      </div>

      {isAdmin ? <StudentsProgress modules={modules} /> : <ProgressView modules={modules} />}
    </div>
  );
}
