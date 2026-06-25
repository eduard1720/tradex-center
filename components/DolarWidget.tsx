import { DollarSign, TrendingUp, RefreshCw } from "lucide-react";
import { getParallelUSD } from "@/lib/dolar";

// Tipo de cambio oficial fijo de Bolivia (referencia).
const OFICIAL = 6.96;

export async function DolarWidget() {
  const rate = await getParallelUSD();

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-pos/15 text-pos">
            <DollarSign className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">Dólar paralelo</h2>
            <p className="text-xs text-muted">Bolivia · tipo de cambio blue</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-pos/10 px-2.5 py-1 text-xs font-medium text-pos">
          <TrendingUp className="h-3.5 w-3.5" /> Paralelo
        </span>
      </div>

      {rate ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-card-soft p-4">
              <p className="text-xs text-muted">Compra</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                Bs {rate.buy.toFixed(2)}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-card-soft p-4">
              <p className="text-xs text-muted">Venta</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                Bs {rate.sell.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted">
            <span>Oficial: Bs {OFICIAL.toFixed(2)}</span>
            <span className="inline-flex items-center gap-1">
              <RefreshCw className="h-3 w-3" /> {rate.source}
            </span>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-line bg-card-soft p-4 text-center text-sm text-muted">
          No se pudo obtener el paralelo en este momento. Intenta recargar en unos minutos.
          <p className="mt-1 text-xs">Oficial: Bs {OFICIAL.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}
