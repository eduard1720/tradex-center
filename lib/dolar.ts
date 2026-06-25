/* -------------------------------------------------------------------------- */
/*  Tipo de cambio paralelo (dólar blue) — Bolivia                            */
/*  Fuente: mercado P2P de Binance (USDT/BOB), referencia real del paralelo.  */
/* -------------------------------------------------------------------------- */

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

const P2P_URL =
  "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";

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
      // Cachea 10 minutos para no golpear la API en cada visita.
      next: { revalidate: 600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { adv?: { price?: string } }[];
    };
    const prices = (json.data ?? [])
      .map((d) => Number(d.adv?.price))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (prices.length === 0) return null;
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  } catch {
    return null;
  }
}

/** Devuelve el paralelo Bolivia, o null si la fuente no está disponible. */
export async function getParallelUSD(): Promise<ParallelRate | null> {
  const [sell, buy] = await Promise.all([
    p2pAverage("SELL"), // anuncios que VENDEN USDT → precio para comprar dólares
    p2pAverage("BUY"), // anuncios que COMPRAN USDT → precio para vender dólares
  ]);
  if (sell == null && buy == null) return null;

  const b = buy ?? sell!;
  const s = sell ?? buy!;
  return {
    buy: Number(s.toFixed(2)),
    sell: Number(b.toFixed(2)),
    avg: Number(((b + s) / 2).toFixed(2)),
    source: "Binance P2P (USDT/BOB)",
    updatedAt: new Date().toISOString(),
  };
}
