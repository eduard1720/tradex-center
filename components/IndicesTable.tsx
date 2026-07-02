"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import type { Instrument } from "@/lib/markets";

function fmt(n: number) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(n: number) {
  const positive = n >= 0;
  return (
    <span className={`font-mono tabular-nums ${positive ? "text-pos" : "text-neg"}`}>
      {positive ? "+" : ""}
      {n.toFixed(2)}%
    </span>
  );
}

export function IndicesTable() {
  const [items, setItems] = useState<Instrument[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "empty">("loading");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/markets", { cache: "no-store" });
      const data = await res.json().catch(() => ({ indices: [] }));
      const list = (data.indices ?? []) as Instrument[];
      setItems(list);
      setStatus(list.length ? "ok" : "empty");
    } catch {
      setStatus((s) => (s === "ok" ? "ok" : "empty"));
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000); // refresca cada 60 s
    return () => clearInterval(id);
  }, [load]);

  if (status === "loading") {
    return (
      <div className="card grid place-items-center py-10 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="card grid place-items-center py-8 text-center text-sm text-muted">
        <BarChart3 className="mb-2 h-5 w-5 text-muted" />
        Los índices no están disponibles en este momento (mercado cerrado o fuente sin datos).
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {items.map((i) => {
        const up = i.changePct >= 0;
        return (
          <div key={i.symbol} className="card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">{i.symbol}</span>
              {up ? (
                <TrendingUp className="h-4 w-4 text-pos" />
              ) : (
                <TrendingDown className="h-4 w-4 text-neg" />
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-muted">{i.name}</p>
            <p className="mt-2 font-mono text-lg font-semibold tabular-nums text-white">{fmt(i.price)}</p>
            <p className="text-sm">{pct(i.changePct)}</p>
          </div>
        );
      })}
    </div>
  );
}
