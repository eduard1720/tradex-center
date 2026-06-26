/* -------------------------------------------------------------------------- */
/*  Tipo de cambio paralelo (dólar blue) — Bolivia                            */
/*  Fuente: CriptoYa (agrega varios exchanges USDT/BOB); respaldo: Binance.   */
/* -------------------------------------------------------------------------- */

import { hasSupabase, getSupabase } from "./supabase";

export interface ParallelRate {
  /** Precio para COMPRAR dólares (Bs por 1 USD). */
  buy: number;
  /** Precio para VENDER dólares (Bs por 1 USD). */
  sell: number;
  /** Promedio compra/venta. */
  avg: number;
  source: string;
  updatedAt: string;
}

const r2 = (n: number) => Number(n.toFixed(2));
const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/* --- Fuente principal: CriptoYa (varios exchanges) ----------------------- */
interface CriptoyaQuote {
  ask?: number;
  bid?: number;
  totalAsk?: number;
  totalBid?: number;
}

async function fromCriptoya(): Promise<ParallelRate | null> {
  try {
    const res = await fetch("https://criptoya.com/api/usdt/bob/1", {
      next: { revalidate: 600 }, // cachea 10 min
    });
    if (!res.ok) return null;
    const json = (await res.json()) as Record<string, CriptoyaQuote>;
    const quotes = Object.values(json).filter(
      (q) => q && typeof q === "object" && (q.ask || q.bid)
    );
    const asks = quotes
      .map((q) => Number(q.totalAsk ?? q.ask))
      .filter((n) => Number.isFinite(n) && n > 1 && n < 50);
    const bids = quotes
      .map((q) => Number(q.totalBid ?? q.bid))
      .filter((n) => Number.isFinite(n) && n > 1 && n < 50);
    if (asks.length === 0 || bids.length === 0) return null;

    const sell = avg(asks); // comprar dólares (lo que pagas)
    const buy = avg(bids); // vender dólares (lo que te dan)
    return {
      buy: r2(buy),
      sell: r2(sell),
      avg: r2((buy + sell) / 2),
      source: "CriptoYa (USDT/BOB)",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/* --- Respaldo: Binance P2P ------------------------------------------------ */
const P2P_URL = "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

async function p2pAverage(tradeType: "BUY" | "SELL"): Promise<number | null> {
  try {
    const res = await fetch(P2P_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        asset: "USDT",
        fiat: "BOB",
        tradeType,
        page: 1,
        rows: 5,
        payTypes: [],
        publisherType: null,
      }),
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { adv?: { price?: string } }[] };
    const prices = (json.data ?? [])
      .map((d) => Number(d.adv?.price))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (prices.length === 0) return null;
    return avg(prices);
  } catch {
    return null;
  }
}

async function fromBinance(): Promise<ParallelRate | null> {
  const [sellAds, buyAds] = await Promise.all([p2pAverage("SELL"), p2pAverage("BUY")]);
  if (sellAds == null && buyAds == null) return null;
  const buyDollar = sellAds ?? buyAds!;
  const sellDollar = buyAds ?? sellAds!;
  return {
    buy: r2(buyDollar),
    sell: r2(sellDollar),
    avg: r2((buyDollar + sellDollar) / 2),
    source: "Binance P2P (USDT/BOB)",
    updatedAt: new Date().toISOString(),
  };
}

/** Devuelve el paralelo Bolivia (CriptoYa, con respaldo a Binance). */
export async function getParallelUSD(): Promise<ParallelRate | null> {
  return (await fromCriptoya()) ?? (await fromBinance());
}

/** Guarda un snapshot sin throttling (lo usa el cron diario). */
export async function recordSnapshot(rate: ParallelRate | null): Promise<void> {
  if (!hasSupabase() || !rate) return;
  try {
    await getSupabase()
      .from("dolar_snapshots")
      .insert({ buy: rate.buy, sell: rate.sell, avg: rate.avg });
  } catch {
    /* noop */
  }
}

/* -------------------------------------------------------------------------- */
/*  Histórico: guarda snapshots intradía en Supabase y devuelve la evolución. */
/*  Requiere la tabla `dolar_snapshots`. Inserta como máximo 1 punto cada     */
/*  ~10 minutos, así la curva se construye a lo largo del día.                */
/* -------------------------------------------------------------------------- */

export interface RatePoint {
  ts: string;
  avg: number;
}

const SNAPSHOT_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 horas (curva diaria)

export async function recordAndGetHistory(
  rate: ParallelRate | null
): Promise<RatePoint[]> {
  if (!hasSupabase()) return [];
  try {
    const sb = getSupabase();

    if (rate) {
      // ¿el último snapshot tiene más de 10 minutos? Entonces guarda uno nuevo.
      const { data: lastRows } = await sb
        .from("dolar_snapshots")
        .select("ts")
        .order("ts", { ascending: false })
        .limit(1);
      const lastTs = lastRows?.[0]?.ts ? new Date(lastRows[0].ts as string).getTime() : 0;
      if (Date.now() - lastTs > SNAPSHOT_INTERVAL_MS) {
        await sb
          .from("dolar_snapshots")
          .insert({ buy: rate.buy, sell: rate.sell, avg: rate.avg });
      }
    }

    const { data, error } = await sb
      .from("dolar_snapshots")
      .select("ts, avg")
      .order("ts", { ascending: false })
      .limit(72);
    if (error || !data) return [];
    return (data as { ts: string; avg: number }[])
      .map((d) => ({ ts: d.ts, avg: Number(d.avg) }))
      .reverse(); // del más antiguo al más reciente
  } catch {
    return [];
  }
}
