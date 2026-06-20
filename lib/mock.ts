// Static demo data for the market-style sections. In a real build this would
// come from a market data API (CoinGecko, Binance, etc.).

export interface Coin {
  symbol: string;
  name: string;
  price: number;
  h1: number;
  h24: number;
  d7: number;
  volume: string;
  cap: string;
  spark: number[];
}

function spark(seed: number, up: boolean): number[] {
  const pts: number[] = [];
  let v = 50 + (seed % 10);
  for (let i = 0; i < 24; i++) {
    const drift = up ? 0.6 : -0.6;
    v += Math.sin(i * 0.7 + seed) * 4 + drift + (((i * seed) % 7) - 3) * 0.8;
    pts.push(Math.max(8, Math.min(92, v)));
  }
  return pts;
}

export const COINS: Coin[] = [
  { symbol: "BTC", name: "Bitcoin", price: 88248.36, h1: 0.01, h24: -0.34, d7: 6.76, volume: "$1.65B", cap: "1.73T", spark: spark(3, true) },
  { symbol: "ETH", name: "Ethereum", price: 1899.82, h1: -0.04, h24: 0.34, d7: -13.53, volume: "$229M", cap: "228B", spark: spark(7, false) },
  { symbol: "SOL", name: "Solana", price: 142.51, h1: 0.22, h24: 2.14, d7: 4.31, volume: "$3.1B", cap: "67B", spark: spark(11, true) },
  { symbol: "BNB", name: "BNB", price: 578.94, h1: 0.22, h24: 0.08, d7: -3.55, volume: "$82M", cap: "84B", spark: spark(5, false) },
  { symbol: "XRP", name: "XRP", price: 2.31, h1: -0.2, h24: 1.44, d7: -8.56, volume: "$133M", cap: "131B", spark: spark(9, false) },
  { symbol: "ADA", name: "Cardano", price: 0.59, h1: 0.13, h24: 1.02, d7: 3.7, volume: "$420M", cap: "21B", spark: spark(13, true) },
  { symbol: "LTC", name: "Litecoin", price: 90.47, h1: -0.14, h24: -1.05, d7: 13.32, volume: "$6.8B", cap: "6.7B", spark: spark(17, true) },
];

export const TOP_MOVERS = [
  { symbol: "REV", name: "Revain", price: 0.02495, chg: 2.38, spark: spark(21, true) },
  { symbol: "ENJ", name: "Enjin", price: 0.09112, chg: -3.24, spark: spark(23, false) },
  { symbol: "NEAR", name: "NEAR", price: 2.63, chg: 2.14, spark: spark(27, true) },
  { symbol: "GRT", name: "Graph", price: 0.09289, chg: -1.68, spark: spark(29, false) },
];

// Equity-style curve used for the "progreso" hero chart on the dashboard.
export const PROGRESS_CURVE: number[] = (() => {
  const pts: number[] = [];
  let v = 20;
  for (let i = 0; i < 60; i++) {
    v += Math.sin(i * 0.35) * 3 + 1.1 + (((i * 7) % 5) - 2) * 0.9;
    pts.push(Math.max(6, v));
  }
  return pts;
})();

export const VOLUME_BARS: number[] = Array.from({ length: 48 }, (_, i) =>
  Math.max(6, 30 + Math.sin(i * 0.6) * 14 + (((i * 5) % 9) - 4) * 3)
);
