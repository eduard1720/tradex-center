import { Trophy, Clock3, Flame, GraduationCap, Award, Target, Zap, Star } from "lucide-react";
import { AreaChart } from "@/components/AreaChart";
import { StatCard } from "@/components/StatCard";
import { PROGRESS_CURVE } from "@/lib/mock";

export const metadata = { title: "Mi progreso — TradeX Center" };

const COURSES = [
  { name: "Fundamentos del trading", done: 8, total: 8 },
  { name: "Análisis técnico", done: 5, total: 9 },
  { name: "Price action avanzado", done: 3, total: 10 },
  { name: "Gestión de riesgo", done: 4, total: 6 },
  { name: "Psicología del trader", done: 2, total: 7 },
];

const BADGES = [
  { icon: Award, label: "Primera clase", got: true },
  { icon: Flame, label: "Racha de 7 días", got: true },
  { icon: Target, label: "10 clases vistas", got: true },
  { icon: Zap, label: "Curso completado", got: true },
  { icon: Star, label: "Top 100 ranking", got: false },
  { icon: Trophy, label: "Maestro del riesgo", got: false },
];

export default function ProgresoPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-sm text-muted">Tu evolución</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Mi progreso</h1>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Clases completadas" value="24" delta="+3" />
        <StatCard icon={Clock3} label="Horas de estudio" value="38.5h" delta="+5.2h" />
        <StatCard icon={Flame} label="Racha actual" value="6 días" delta="🔥" />
        <StatCard icon={Trophy} label="Ranking" value="#142" delta="+18" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Horas de estudio</h2>
            <span className="text-sm text-pos">+18% vs. mes anterior</span>
          </div>
          <AreaChart data={PROGRESS_CURVE} height={200} />
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-base font-semibold text-white">Logros</h2>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map((b) => {
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

      <div className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-white">Progreso por curso</h2>
        <div className="space-y-4">
          {COURSES.map((c) => {
            const pct = Math.round((c.done / c.total) * 100);
            return (
              <div key={c.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-white">{c.name}</span>
                  <span className="text-muted">
                    {c.done}/{c.total} · {pct}%
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
    </div>
  );
}
