import { ArrowLeft, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Sparkline } from "@/components/Sparkline";
import { COINS, TOP_MOVERS } from "@/lib/mock";

export const metadata = { title: "Mercado — Hurtado Trader Academy" };

function pct(n: number) {
  const positive = n >= 0;
  return (
    <span className={positive ? "text-pos" : "text-neg"}>
      {positive ? "+" : ""}
      {n.toFixed(2)}%
    </span>
  );
}

export default function MercadoPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Datos de mercado</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Explorar mercado
          </h1>
        </div>
        <span className="chip">Datos de demostración</span>
      </div>

      {/* Top movers */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Más movidos</h2>
          <div className="flex gap-2">
            <button className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-white">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-white">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TOP_MOVERS.map((m) => (
            <div key={m.symbol} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-card-soft text-xs font-bold text-brand">
                    {m.symbol[0]}
                  </span>
                  <div className="leading-tight">
                    <p className="text-sm font-semibold text-white">{m.symbol}</p>
                    <p className="text-[11px] text-muted">{m.name}</p>
                  </div>
                </div>
              </div>
              <div className="my-2">
                <Sparkline data={m.spark} positive={m.chg >= 0} width={220} height={44} />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-white">${m.price}</span>
                <span>{pct(m.chg)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-black">
              Todas
            </span>
            <span className="rounded-lg px-3 py-1.5 text-sm text-muted">NFTs</span>
            <span className="rounded-lg px-3 py-1.5 text-sm text-muted">Categorías</span>
          </div>
          <button className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white">
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-3 py-3 text-right font-medium">Precio</th>
                <th className="px-3 py-3 text-right font-medium">1h %</th>
                <th className="px-3 py-3 text-right font-medium">24h %</th>
                <th className="px-3 py-3 text-right font-medium">7d %</th>
                <th className="px-3 py-3 text-right font-medium">Volumen (24h)</th>
                <th className="px-3 py-3 text-right font-medium">Cap. mercado</th>
                <th className="px-5 py-3 text-right font-medium">Últimos 7d</th>
              </tr>
            </thead>
            <tbody>
              {COINS.map((c) => (
                <tr key={c.symbol} className="border-t border-line hover:bg-card-hover/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-card-soft text-xs font-bold text-brand">
                        {c.symbol[0]}
                      </span>
                      <div className="leading-tight">
                        <p className="font-medium text-white">{c.symbol}</p>
                        <p className="text-[11px] text-muted">{c.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right font-medium text-white">
                    ${c.price.toLocaleString("en-US")}
                  </td>
                  <td className="px-3 py-3.5 text-right">{pct(c.h1)}</td>
                  <td className="px-3 py-3.5 text-right">{pct(c.h24)}</td>
                  <td className="px-3 py-3.5 text-right">{pct(c.d7)}</td>
                  <td className="px-3 py-3.5 text-right text-muted">{c.volume}</td>
                  <td className="px-3 py-3.5 text-right text-muted">{c.cap}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <Sparkline data={c.spark} positive={c.d7 >= 0} width={120} height={36} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
