/* -------------------------------------------------------------------------- */
/*  Índices y materias primas (NASDAQ, S&P500, US30, oro, petróleo).          */
/*  Fuente gratuita sin API key: Yahoo Finance (endpoint chart). Se consulta   */
/*  desde el servidor para evitar CORS y poder enviar User-Agent.             */
/* -------------------------------------------------------------------------- */

export interface Instrument {
  symbol: string; // etiqueta corta (US100, US500...)
  name: string; // nombre legible
  price: number;
  changePct: number; // variación vs cierre anterior
}

// code = símbolo en Yahoo Finance.
const INSTRUMENTS = [
  { code: "^NDX", symbol: "US100", name: "NASDAQ 100" },
  { code: "^GSPC", symbol: "US500", name: "S&P 500" },
  { code: "^DJI", symbol: "US30", name: "Dow Jones" },
  { code: "GC=F", symbol: "ORO", name: "Oro · XAU" },
  { code: "CL=F", symbol: "WTI", name: "Petróleo · WTI" },
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

interface YahooMeta {
  regularMarketPrice?: number;
  chartPreviousClose?: number;
  previousClose?: number;
}

async function fetchOne(code: string): Promise<YahooMeta | null> {
  const path = `v8/finance/chart/${encodeURIComponent(code)}?range=1d&interval=1d`;
  for (const host of ["query1.finance.yahoo.com", "query2.finance.yahoo.com"]) {
    try {
      const res = await fetch(`https://${host}/${path}`, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        next: { revalidate: 60 },
      });
      if (!res.ok) continue;
      const json = (await res.json()) as {
        chart?: { result?: { meta?: YahooMeta }[] };
      };
      const meta = json.chart?.result?.[0]?.meta;
      if (meta?.regularMarketPrice != null) return meta;
    } catch {
      /* intenta el siguiente host */
    }
  }
  return null;
}

export async function getIndices(): Promise<Instrument[]> {
  const results = await Promise.all(INSTRUMENTS.map((i) => fetchOne(i.code)));
  const out: Instrument[] = [];
  results.forEach((meta, idx) => {
    if (!meta || meta.regularMarketPrice == null) return;
    const price = meta.regularMarketPrice;
    const prev = meta.chartPreviousClose ?? meta.previousClose;
    const changePct = prev && prev > 0 ? ((price - prev) / prev) * 100 : 0;
    out.push({
      symbol: INSTRUMENTS[idx].symbol,
      name: INSTRUMENTS[idx].name,
      price,
      changePct,
    });
  });
  return out;
}
