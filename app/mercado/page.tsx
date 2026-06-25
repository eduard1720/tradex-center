import { MarketTable } from "@/components/MarketTable";

export const metadata = { title: "Mercado — TradeX Center" };

export default function MercadoPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Datos de mercado en tiempo real</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Explorar mercado
          </h1>
        </div>
      </div>

      <MarketTable />
    </div>
  );
}
