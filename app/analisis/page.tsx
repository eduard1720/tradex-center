import { Sparkles, TrendingUp, AlertTriangle, Brain, ArrowUpRight } from "lucide-react";
import { Sparkline } from "@/components/Sparkline";
import { COINS } from "@/lib/mock";

export const metadata = { title: "Análisis IA — TradeX Center" };

const INSIGHTS = [
  {
    icon: TrendingUp,
    tone: "pos" as const,
    title: "BTC mantiene estructura alcista",
    body: "El precio respeta el order block de 4H. Sesgo alcista mientras se sostenga sobre $84.2k.",
  },
  {
    icon: AlertTriangle,
    tone: "neg" as const,
    title: "ETH pierde soporte clave",
    body: "Ruptura de la zona de demanda diaria. Atención a un posible retesteo antes de continuar.",
  },
  {
    icon: Brain,
    tone: "brand" as const,
    title: "Patrón detectado: doble suelo en SOL",
    body: "Confluencia con RSI en sobreventa. Sugiere recuperación a corto plazo.",
  },
];

const toneClass: Record<string, string> = {
  pos: "border-pos/30 bg-pos/10 text-pos",
  neg: "border-neg/30 bg-neg/10 text-neg",
  brand: "border-brand/30 bg-brand-soft text-brand",
};

export default function AnalisisPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm text-brand">
            <Sparkles className="h-4 w-4" /> Asistente IA
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Análisis del mercado
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Resúmenes generados automáticamente para complementar lo que aprendes en
            las clases. Educativo, no es asesoría financiera.
          </p>
        </div>
        <span className="chip">Demostración</span>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {INSIGHTS.map((ins) => {
          const Icon = ins.icon;
          return (
            <div key={ins.title} className="card p-5">
              <span className={`inline-grid h-10 w-10 place-items-center rounded-xl border ${toneClass[ins.tone]}`}>
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-white">{ins.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{ins.body}</p>
              <button className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand">
                Ver clase relacionada <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-base font-semibold text-white">Sentimiento por activo</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COINS.slice(0, 6).map((c) => (
            <div key={c.symbol} className="flex items-center gap-3 rounded-xl border border-line bg-card-soft p-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-card text-xs font-bold text-brand">
                {c.symbol[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{c.symbol}</p>
                <p className={`text-xs ${c.d7 >= 0 ? "text-pos" : "text-neg"}`}>
                  {c.d7 >= 0 ? "Alcista" : "Bajista"} · 7d {c.d7 >= 0 ? "+" : ""}{c.d7}%
                </p>
              </div>
              <Sparkline data={c.spark} positive={c.d7 >= 0} width={80} height={32} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
