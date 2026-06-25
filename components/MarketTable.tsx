"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Sparkline } from "@/components/Sparkline";

interface CGCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_1h_in_currency: number | null;
  price_change_percentage_24h_in_currency: number | null;
  price_change_percentage_7d_in_currency: number | null;
  total_volume: number;
  market_cap: number;
  sparkline_in_7d: { price: number[] } | null;
}

const API =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h%2C24h%2C7d";

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

function pct(n: number | null) {
  if (n == null) return <span className="text-muted">—</span>;
  const positive = n >= 0;
  return (
    <span className={positive ? "text-pos" : "text-neg"}>
      {positive ? "+" : ""}
      {n.toFixed(2)}%
    </span>
  );
}

function price(n: number) {
  return n >= 1 ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : n.toPrecision(4);
}

export function MarketTable() {
  const [coins, setCoins] = useState<CGCoin[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [updated, setUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as CGCoin[];
      setCoins(data);
      setStatus("ok");
      setUpdated(new Date());
    } catch {
      setStatus((s) => (s === "ok" ? "ok" : "error"));
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 45000); // refresca cada 45 s
    return () => clearInterval(id);
  }, [load]);

  const movers = [...coins]
    .filter((c) => c.price_change_percentage_24h_in_currency != null)
    .sort(
      (a, b) =>
        Math.abs(b.price_change_percentage_24h_in_currency ?? 0) -
        Math.abs(a.price_change_percentage_24h_in_currency ?? 0)
    )
    .slice(0, 4);

  if (status === "loading") {
    return (
      <div className="card grid place-items-center py-20 text-muted">
        <Loader2 className="mb-2 h-6 w-6 animate-spin" />
        Cargando datos del mercado en vivo...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="card grid place-items-center py-20 text-center text-muted">
        <AlertCircle className="mb-2 h-6 w-6 text-neg" />
        No se pudo cargar el mercado. Reintenta en unos segundos.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="inline-flex items-center gap-1.5 text-xs text-muted">
        <RefreshCw className="h-3.5 w-3.5 text-pos" />
        En vivo · CoinGecko
        {updated && ` · actualizado ${updated.toLocaleTimeString("es-BO")}`}
      </p>

      {/* Top movers */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Más movidos (24h)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {movers.map((m) => (
            <div key={m.id} className="card p-4">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.image} alt={m.name} className="h-8 w-8 rounded-full" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">{m.symbol.toUpperCase()}</p>
                  <p className="text-[11px] text-muted">{m.name}</p>
                </div>
              </div>
              <div className="my-2">
                <Sparkline
                  data={m.sparkline_in_7d?.price ?? []}
                  positive={(m.price_change_percentage_24h_in_currency ?? 0) >= 0}
                  width={220}
                  height={44}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-white">${price(m.current_price)}</span>
                {pct(m.price_change_percentage_24h_in_currency)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
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
              {coins.map((c) => (
                <tr key={c.id} className="border-t border-line hover:bg-card-hover/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.image} alt={c.name} className="h-8 w-8 rounded-full" />
                      <div className="leading-tight">
                        <p className="font-medium text-white">{c.symbol.toUpperCase()}</p>
                        <p className="text-[11px] text-muted">{c.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right font-medium text-white">${price(c.current_price)}</td>
                  <td className="px-3 py-3.5 text-right">{pct(c.price_change_percentage_1h_in_currency)}</td>
                  <td className="px-3 py-3.5 text-right">{pct(c.price_change_percentage_24h_in_currency)}</td>
                  <td className="px-3 py-3.5 text-right">{pct(c.price_change_percentage_7d_in_currency)}</td>
                  <td className="px-3 py-3.5 text-right text-muted">${compact.format(c.total_volume)}</td>
                  <td className="px-3 py-3.5 text-right text-muted">${compact.format(c.market_cap)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end">
                      <Sparkline
                        data={c.sparkline_in_7d?.price ?? []}
                        positive={(c.price_change_percentage_7d_in_currency ?? 0) >= 0}
                        width={120}
                        height={36}
                      />
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
