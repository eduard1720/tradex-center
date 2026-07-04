"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Users, Percent, Trophy, Loader2, Lock } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useAdmin, getAdminPw } from "@/lib/admin";
import type { ProgressModule } from "@/components/ProgressView";

interface StudentProgress {
  id: number;
  name: string;
  active: boolean;
  completed: string[];
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function StudentsProgress({ modules }: { modules: ProgressModule[] }) {
  const isAdmin = useAdmin();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Ids de clases que sí cuentan para el avance (las que están en módulos).
  const lessonIds = useMemo(
    () => new Set(modules.flatMap((m) => m.lessons.map((l) => l.id))),
    [modules]
  );
  const totalLessons = lessonIds.size;

  const load = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const res = await fetch("/api/students/progress", {
      cache: "no-store",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    const data = await res.json().catch(() => ({ students: [] }));
    setStudents(data.students ?? []);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  // Avance por alumno (solo clases de módulos), ordenado de mayor a menor.
  const rows = useMemo(() => {
    return students
      .map((s) => {
        const done = s.completed.filter((id) => lessonIds.has(id)).length;
        const pct = totalLessons ? Math.round((done / totalLessons) * 100) : 0;
        return { ...s, done, pct };
      })
      .sort((a, b) => b.pct - a.pct || a.name.localeCompare(b.name));
  }, [students, lessonIds, totalLessons]);

  const summary = useMemo(() => {
    const n = rows.length;
    const avg = n ? Math.round(rows.reduce((acc, r) => acc + r.pct, 0) / n) : 0;
    const finished = rows.filter((r) => totalLessons > 0 && r.done === totalLessons).length;
    return { n, avg, finished };
  }, [rows, totalLessons]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card space-y-2 p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
            <Lock className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold text-white">Solo para Angel</h2>
          <p className="text-sm text-muted">
            Inicia sesión como administrador desde el menú lateral para ver el avance de tus alumnos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Alumnos" value={`${summary.n}`} />
        <StatCard icon={Percent} label="Avance promedio" value={`${summary.avg}%`} />
        <StatCard icon={Trophy} label="Curso completado" value={`${summary.finished}`} />
      </div>

      {loading ? (
        <div className="card grid place-items-center py-16 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : rows.length === 0 ? (
        <div className="card grid place-items-center py-16 text-center text-muted">
          Aún no hay alumnos. Añádelos desde “Alumnos” para ver aquí su avance.
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-4 py-3 text-xs text-muted">
            {rows.length} {rows.length === 1 ? "alumno" : "alumnos"} · {totalLessons} clases en total
          </div>
          <ul className="divide-y divide-line border-t border-line">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-3 p-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.06] text-xs font-semibold text-white/80">
                  {initials(r.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-white">
                      {r.name}
                      {!r.active && (
                        <span className="ml-2 rounded-full bg-neg/10 px-2 py-0.5 text-[10px] font-medium text-neg">
                          Bloqueado
                        </span>
                      )}
                    </p>
                    <span className="shrink-0 text-xs text-muted">
                      {r.done}/{totalLessons} · {r.pct}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-card-soft">
                    <span
                      className={`block h-full rounded-full ${r.pct === 100 ? "bg-pos" : "bg-brand"}`}
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
