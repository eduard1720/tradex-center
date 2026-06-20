import Link from "next/link";
import { ArrowRight, GraduationCap, Layers } from "lucide-react";
import { getAllClasses } from "@/lib/data";
import { CATEGORIES } from "@/lib/types";

export const metadata = { title: "Rutas — Hurtado Trader Academy" };
export const dynamic = "force-dynamic";

const ROUTE_META: Record<string, { tagline: string; emoji: string }> = {
  Fundamentos: { tagline: "Empieza desde cero y domina las bases.", emoji: "🌱" },
  "Análisis Técnico": { tagline: "Indicadores, niveles y lectura de gráficos.", emoji: "📊" },
  "Price Action": { tagline: "Opera leyendo la estructura del precio.", emoji: "🕯️" },
  "Gestión de Riesgo": { tagline: "Protege tu capital y opera con cabeza.", emoji: "🛡️" },
  Psicología: { tagline: "Disciplina y mentalidad de trader profesional.", emoji: "🧠" },
  Cripto: { tagline: "Bitcoin, altcoins y mercados 24/7.", emoji: "₿" },
  Forex: { tagline: "Pares de divisas y sesiones globales.", emoji: "💱" },
  "En Vivo": { tagline: "Sesiones grabadas y análisis semanales.", emoji: "🔴" },
};

export default async function RutasPage() {
  const classes = await getAllClasses();

  const routes = CATEGORIES.map((cat) => {
    const items = classes.filter((c) => c.category === cat);
    const minutes = items.reduce((s, c) => s + c.durationMin, 0);
    return { cat, items, minutes };
  }).filter((r) => r.items.length > 0);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-sm text-muted">Aprende paso a paso</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Rutas de aprendizaje
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Sigue un camino ordenado por temas. Cada ruta agrupa las clases de Angel
          para llevarte de principiante a trader consistente.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map(({ cat, items, minutes }, i) => {
          const meta = ROUTE_META[cat];
          const progress = [70, 45, 30, 15, 0][i % 5];
          return (
            <div key={cat} className="card flex flex-col p-5 transition-colors hover:border-white/15">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-xl">
                  {meta?.emoji ?? "📈"}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  <Layers className="h-3.5 w-3.5" /> {items.length} clases
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">{cat}</h3>
              <p className="mt-1 flex-1 text-sm text-muted">{meta?.tagline}</p>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-xs text-muted">
                  <span>{progress}% completado</span>
                  <span>{Math.round(minutes / 6) / 10}h</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-card-soft">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <Link
                href={`/clases?cat=${encodeURIComponent(cat)}`}
                className="mt-4 inline-flex items-center justify-between rounded-xl border border-line px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-card-hover"
              >
                <span className="inline-flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-brand" /> Continuar ruta
                </span>
                <ArrowRight className="h-4 w-4 text-muted" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
