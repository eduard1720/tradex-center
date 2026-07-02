"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Loader2, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Datos de mercado en vivo desde Binance (API pública, sin clave).          */
/* -------------------------------------------------------------------------- */

interface Ticker {
  symbol: string; // par sin USDT (BTC, ETH...)
  name: string;
  price: number;
  changePct: number;
  volume: number; // volumen en USDT (quoteVolume)
}

interface BinanceRow {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

// Pares a mostrar (todos contra USDT) con su nombre legible.
const PAIRS: { symbol: string; name: string }[] = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "BNB", name: "BNB" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "XRP", name: "XRP" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "DOGE", name: "Dogecoin" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "TRX", name: "TRON" },
  { symbol: "LTC", name: "Litecoin" },
  { symbol: "MATIC", name: "Polygon" },
  { symbol: "ATOM", name: "Cosmos" },
  { symbol: "NEAR", name: "NEAR" },
  { symbol: "UNI", name: "Uniswap" },
];

const NAME_BY_SYMBOL = new Map(PAIRS.map((p) => [`${p.symbol}USDT`, p]));

const SYMBOLS_PARAM = encodeURIComponent(
  JSON.stringify(PAIRS.map((p) => `${p.symbol}USDT`))
);
const API = `https://api.binance.com/api/v3/ticker/24hr?symbols=${SYMBOLS_PARAM}`;

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

function pct(n: number) {
  const positive = n >= 0;
  return (
    <span className={`font-mono tabular-nums ${positive ? "text-pos" : "text-neg"}`}>
      {positive ? "+" : ""}
      {n.toFixed(2)}%
    </span>
  );
}

function price(n: number) {
  return n >= 1 ? n.toLocaleString("en-US", { maximumFractionDigits: 2 }) : n.toPrecision(4);
}

export function MarketTable() {
  const [coins, setCoins] = useState<Ticker[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [updated, setUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(API, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as BinanceRow[];
      const mapped: Ticker[] = data.map((r) => {
        const meta = NAME_BY_SYMBOL.get(r.symbol);
        return {
          symbol: meta?.symbol ?? r.symbol.replace("USDT", ""),
          name: meta?.name ?? r.symbol,
          price: Number(r.lastPrice),
          changePct: Number(r.priceChangePercent),
          volume: Number(r.quoteVolume),
        };
      });
      // Conserva el orden de PAIRS.
      mapped.sort(
        (a, b) =>
          PAIRS.findIndex((p) => p.symbol === a.symbol) -
          PAIRS.findIndex((p) => p.symbol === b.symbol)
      );
      setCoins(mapped);
      setStatus("ok");
      setUpdated(new Date());
    } catch {
      setStatus((s) => (s === "ok" ? "ok" : "error"));
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000); // refresca cada 30 s
    return () => clearInterval(id);
  }, [load]);

  const movers = [...coins]
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
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
        En vivo · Binance
        {updated && ` · actualizado ${updated.toLocaleTimeString("es-BO")}`}
      </p>

      {/* Top movers */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-white">Más movidos (24h)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {movers.map((m) => (
            <div key={m.symbol} className="card p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-white/80">
                  {m.symbol.slice(0, 3)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">{m.symbol}</p>
                  <p className="text-[11px] text-muted">{m.name}</p>
                </div>
                {m.changePct >= 0 ? (
                  <TrendingUp className="ml-auto h-4 w-4 text-pos" />
                ) : (
                  <TrendingDown className="ml-auto h-4 w-4 text-neg" />
                )}
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="font-mono font-medium tabular-nums text-white">${price(m.price)}</span>
                {pct(m.changePct)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-5 py-3 font-medium">Activo</th>
                <th className="px-3 py-3 text-right font-medium">Precio</th>
                <th className="px-3 py-3 text-right font-medium">24h %</th>
                <th className="px-5 py-3 text-right font-medium">Volumen (24h)</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((c) => (
                <tr key={c.symbol} className="border-t border-line hover:bg-card-hover/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.06] text-[11px] font-semibold text-white/80">
                        {c.symbol.slice(0, 3)}
                      </span>
                      <div className="leading-tight">
                        <p className="font-medium text-white">{c.symbol}</p>
                        <p className="text-[11px] text-muted">{c.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-right font-mono font-medium tabular-nums text-white">${price(c.price)}</td>
                  <td className="px-3 py-3.5 text-right">{pct(c.changePct)}</td>
                  <td className="px-5 py-3.5 text-right font-mono tabular-nums text-muted">${compact.format(c.volume)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
