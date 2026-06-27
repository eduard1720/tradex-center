"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Layers,
  Percent,
  Award,
  Target,
  Flame,
  Zap,
  Trophy,
  Loader2,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { CertificateCard } from "@/components/CertificateCard";
import { getCompleted, onProgressChange } from "@/lib/progress";

export interface ProgressModule {
  module: number;
  title: string;
  lessons: { id: string; title: string }[];
}

export function ProgressView({ modules }: { modules: ProgressModule[] }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setCompleted(new Set(getCompleted()));
    sync();
    setReady(true);
    return onProgressChange(sync);
  }, []);

  const stats = useMemo(() => {
    const all = modules.flatMap((m) => m.lessons);
    const total = all.length;
    const done = all.filter((l) => completed.has(l.id)).length;
    const modulesDone = modules.filter(
      (m) => m.lessons.length > 0 && m.lessons.every((l) => completed.has(l.id))
    ).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    return { total, done, modulesDone, totalModules: modules.length, pct };
  }, [modules, completed]);

  const badges = useMemo(
    () => [
      { icon: Award, label: "Primera clase", got: stats.done >= 1 },
      { icon: Target, label: "5 clases vistas", got: stats.done >= 5 },
      { icon: Flame, label: "10 clases vistas", got: stats.done >= 10 },
      { icon: Layers, label: "Primer módulo", got: stats.modulesDone >= 1 },
      { icon: Zap, label: "Mitad del curso", got: stats.total > 0 && stats.pct >= 50 },
      {
        icon: Trophy,
        label: "Curso completado",
        got: stats.total > 0 && stats.done === stats.total,
      },
    ],
    [stats]
  );

  if (modules.length === 0) {
    return (
      <div className="card grid place-items-center py-16 text-center text-muted">
        Aún no hay clases en módulos. Tu progreso aparecerá aquí cuando Angel publique el curso.
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="card grid place-items-center py-16 text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={GraduationCap}
          label="Clases completadas"
          value={`${stats.done}/${stats.total}`}
        />
        <StatCard
          icon={Layers}
          label="Módulos completados"
          value={`${stats.modulesDone}/${stats.totalModules}`}
        />
        <StatCard icon={Percent} label="Avance del curso" value={`${stats.pct}%`} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Progreso por módulo (real) */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-white">Progreso por módulo</h2>
          <div className="space-y-4">
            {modules.map((m) => {
              const done = m.lessons.filter((l) => completed.has(l.id)).length;
              const pct = m.lessons.length ? Math.round((done / m.lessons.length) * 100) : 0;
              return (
                <div key={m.module}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-white">
                      Módulo {m.module}
                      {m.title ? ` · ${m.title}` : ""}
                    </span>
                    <span className="text-muted">
                      {done}/{m.lessons.length} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-card-soft">
                    <span
                      className={`block h-full rounded-full ${pct === 100 ? "bg-pos" : "bg-brand"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logros derivados del avance real */}
        <div className="card p-5">
          <h2 className="mb-4 text-base font-semibold text-white">Logros</h2>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.label}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center ${
                    b.got ? "border-brand/30 bg-brand-soft" : "border-line bg-card-soft opacity-50"
                  }`}
                >
                  <Icon className={`h-6 w-6 ${b.got ? "text-brand" : "text-muted"}`} />
                  <span className="text-[10px] leading-tight text-muted">{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CertificateCard totalLessons={stats.total} />
    </div>
  );
}
