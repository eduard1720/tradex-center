import { MarketTable } from "@/components/MarketTable";
import { IndicesTable } from "@/components/IndicesTable";

export const metadata = { title: "Mercado — TradeX Center" };

export default function MercadoPage() {
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Mercado
          </h1>
          <p className="mt-1 text-sm text-muted">Índices, materias primas y cripto en tiempo real.</p>
        </div>
      </div>

      {/* Índices y materias primas */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Índices y materias primas</h2>
          <p className="text-xs text-muted">
            NASDAQ 100, S&amp;P 500, US30, oro y petróleo · fuente Stooq (variación de la sesión)
          </p>
        </div>
        <IndicesTable />
      </div>

      {/* Criptomonedas */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Criptomonedas</h2>
        <MarketTable />
      </div>
    </div>
  );
}
