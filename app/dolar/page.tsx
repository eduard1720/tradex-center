import { DollarSign, TrendingUp, RefreshCw, LineChart } from "lucide-react";
import { AreaChart } from "@/components/AreaChart";
import { getParallelUSD, recordAndGetHistory } from "@/lib/dolar";

export const metadata = { title: "Cambio paralelo — TradeX Center" };
export const dynamic = "force-dynamic";

// Tipo de cambio oficial fijo de Bolivia (referencia).
const OFICIAL = 6.96;

function formatTs(ts: string, withTime: boolean): string {
  return new Date(ts).toLocaleString("es-BO", {
    day: "numeric",
    month: "short",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "America/La_Paz",
  });
}

export default async function DolarPage() {
  const rate = await getParallelUSD();
  const history = await recordAndGetHistory(rate);
  const points = history.points;
  const series = points.map((h) => h.avg);
  const intraday = !history.daily;

  const first = series[0];
  const last = series[series.length - 1];
  const variation =
    first && last ? Number((((last - first) / first) * 100).toFixed(2)) : 0;
  const brecha = rate ? Number((((rate.avg - OFICIAL) / OFICIAL) * 100).toFixed(1)) : 0;

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="inline-flex items-center gap-1.5 text-sm text-pos">
          <DollarSign className="h-4 w-4" /> Cambio paralelo · Bolivia
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Dólar blue
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Cotización del dólar paralelo en Bolivia (USDT/BOB, promedio de varios
          exchanges vía CriptoYa). Referencia educativa, no es casa de cambio.
        </p>
      </div>

      {/* Cotización actual */}
      {rate ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs text-muted">Compra</p>
            <p className="mt-1 text-3xl font-semibold text-white">Bs {rate.buy.toFixed(2)}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted">Venta</p>
            <p className="mt-1 text-3xl font-semibold text-white">Bs {rate.sell.toFixed(2)}</p>
          </div>
          <div className="card p-5">
            <p className="text-xs text-muted">Brecha vs oficial</p>
            <p className="mt-1 text-3xl font-semibold text-pos">+{brecha}%</p>
            <p className="mt-1 text-xs text-muted">Oficial: Bs {OFICIAL.toFixed(2)}</p>
          </div>
        </div>
      ) : (
        <div className="card p-5 text-center text-sm text-muted">
          No se pudo obtener el paralelo en este momento. Intenta recargar en unos minutos.
        </div>
      )}

      {/* Evolución */}
      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <LineChart className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white">Evolución del paralelo</h2>
              <p className="text-xs text-muted">
                {intraday ? "Hoy, por horas (Bs por USD)" : "Promedio diario (Bs por USD)"}
              </p>
            </div>
          </div>
          {series.length >= 2 && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                variation >= 0 ? "bg-pos/10 text-pos" : "bg-neg/10 text-neg"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              {variation >= 0 ? "+" : ""}
              {variation}% en el periodo
            </span>
          )}
        </div>

        {series.length >= 2 ? (
          <>
            <AreaChart data={series} height={220} />
            <div className="mt-2 flex justify-between text-[11px] text-muted">
              <span>{formatTs(points[0].ts, intraday)}</span>
              <span>{formatTs(points[points.length - 1].ts, intraday)}</span>
            </div>
          </>
        ) : (
          <div className="grid place-items-center rounded-xl border border-dashed border-line py-12 text-center">
            <RefreshCw className="mb-2 h-5 w-5 text-muted" />
            <p className="text-sm text-muted">
              Aún estamos tomando la primera lectura del paralelo.
            </p>
            <p className="text-xs text-muted">
              Recarga en unos minutos para ver la evolución. 📈
            </p>
          </div>
        )}
      </div>

      {rate && (
        <p className="text-center text-xs text-muted">
          Fuente: {rate.source} · actualizado{" "}
          {new Date(rate.updatedAt).toLocaleString("es-BO")}
        </p>
      )}
    </div>
  );
}
