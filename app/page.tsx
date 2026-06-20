import Link from "next/link";
import {
  Upload,
  Sparkles,
  Trophy,
  Clock3,
  Flame,
  GraduationCap,
  ArrowUpRight,
  Radio,
  Play,
} from "lucide-react";
import { AreaChart } from "@/components/AreaChart";
import { RangeTabs } from "@/components/RangeTabs";
import { StatCard } from "@/components/StatCard";
import { ClassCard } from "@/components/ClassCard";
import { getAllClasses } from "@/lib/data";
import { PROGRESS_CURVE, VOLUME_BARS } from "@/lib/mock";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const classes = await getAllClasses();
  const featured = classes[0];
  const recent = classes.slice(0, 3);
  const live = classes.find((c) => c.category === "En Vivo") ?? classes[1];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Bienvenido de vuelta 👋</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Inicio
          </h1>
        </div>
        <Link href="/subir" className="btn-primary">
          <Upload className="h-4 w-4" /> Subir nueva clase
        </Link>
      </div>

      {/* Hero grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Progress chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted">Tu progreso global</p>
              <div className="mt-1 flex items-end gap-2">
                <span className="text-3xl font-semibold tracking-tight text-white">
                  68<span className="text-muted">.4%</span>
                </span>
                <span className="mb-1 inline-flex items-center gap-1 text-sm font-medium text-pos">
                  <ArrowUpRight className="h-4 w-4" /> +12% este mes
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Fundamentos · Análisis Técnico · Price Action
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-line bg-card-soft p-1 text-xs">
                <span className="rounded-lg bg-white px-2.5 py-1 font-medium text-black">
                  Actual
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-muted">
                  <Sparkles className="h-3.5 w-3.5" /> Predicción IA
                </span>
              </div>
              <RangeTabs />
            </div>
          </div>

          <AreaChart data={PROGRESS_CURVE} height={210} />

          {/* Volume bars */}
          <div className="mt-3 flex h-12 items-end gap-[3px]">
            {VOLUME_BARS.map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm bg-white/10"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted">
            <span>8 am</span>
            <span>12 pm</span>
            <span>4 pm</span>
            <span>8 pm</span>
            <span>Hoy</span>
          </div>
        </div>

        {/* Right column: continue watching + live */}
        <div className="flex flex-col gap-5">
          {featured && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-4">
                <p className="text-sm font-medium text-white">Sigue donde lo dejaste</p>
                <span className="chip">En curso</span>
              </div>
              <Link href={`/clases/${featured.id}`} className="group block px-5 pb-2 pt-3">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-card-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featured.thumbnail}
                    alt={featured.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/20">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-brand text-black shadow-glow">
                      <Play className="h-5 w-5 fill-black" />
                    </span>
                  </span>
                  <span className="absolute bottom-0 left-0 h-1 w-2/3 bg-brand" />
                </div>
                <h3 className="mt-3 line-clamp-1 text-sm font-semibold text-white">
                  {featured.title}
                </h3>
                <p className="text-xs text-muted">{featured.durationMin} min · 66% completado</p>
              </Link>
            </div>
          )}

          {live && (
            <Link
              href={`/clases/${live.id}`}
              className="card group relative overflow-hidden p-5 transition-colors hover:border-brand/40"
            >
              <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand/20 blur-2xl" />
              <span className="inline-flex items-center gap-1.5 rounded-full bg-neg/15 px-2.5 py-1 text-xs font-medium text-neg">
                <Radio className="h-3.5 w-3.5" /> Próxima en vivo
              </span>
              <h3 className="mt-3 text-base font-semibold text-white">{live.title}</h3>
              <p className="mt-1 text-xs text-muted">
                Reserva tu lugar para la sesión semanal con Angel.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                Ver detalles <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Clases completadas" value="24" delta="+3" />
        <StatCard icon={Clock3} label="Horas de estudio" value="38.5h" delta="+5.2h" />
        <StatCard icon={Flame} label="Racha actual" value="6 días" delta="🔥" />
        <StatCard icon={Trophy} label="Ranking comunidad" value="#142" delta="+18" />
      </div>

      {/* Recent classes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Clases recientes</h2>
          <Link href="/clases" className="text-sm text-brand hover:text-brand-hover">
            Ver todas →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((c) => (
            <ClassCard key={c.id} cls={c} progress={c.id === featured?.id ? 66 : undefined} />
          ))}
        </div>
      </div>
    </div>
  );
}
