"use client";

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";

function diff(target: number) {
  const ms = target - Date.now();
  const clamped = Math.max(0, ms);
  return {
    ms,
    days: Math.floor(clamped / 86400000),
    hours: Math.floor((clamped % 86400000) / 3600000),
    minutes: Math.floor((clamped % 3600000) / 60000),
    seconds: Math.floor((clamped % 60000) / 1000),
  };
}

function Cell({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="grid h-14 w-14 place-items-center rounded-xl border border-line bg-card-soft text-2xl font-semibold tabular-nums text-white">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-muted">{label}</span>
    </div>
  );
}

/** Cuenta regresiva hasta el inicio de la clase en vivo. */
export function LiveCountdown({ startsAt }: { startsAt: string }) {
  const target = new Date(startsAt).getTime();
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  // La clase ya empezó (o empezó hace poco).
  if (t.ms <= 0) {
    return (
      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-neg/15 px-3 py-1.5 text-sm font-medium text-neg">
        <Radio className="h-4 w-4 animate-pulse" /> ¡La sesión está en vivo ahora!
      </p>
    );
  }

  return (
    <div className="mt-4">
      <p className="mb-2 text-xs uppercase tracking-wider text-muted">Comienza en</p>
      <div className="flex items-center gap-2.5">
        {t.days > 0 && <Cell value={t.days} label="días" />}
        <Cell value={t.hours} label="horas" />
        <Cell value={t.minutes} label="min" />
        <Cell value={t.seconds} label="seg" />
      </div>
    </div>
  );
}
