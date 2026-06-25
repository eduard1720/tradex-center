"use client";

import { CalendarClock, AlertTriangle, RefreshCw } from "lucide-react";
import { SITE, waLink } from "@/lib/site";

function daysLeft(date: string): number {
  const end = new Date(date + "T23:59:59").getTime();
  return Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24));
}

function formatShort(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("es-BO", {
    day: "numeric",
    month: "short",
  });
}

const renewUrl = () =>
  waLink(`Hola Angel, quiero renovar mi suscripción mensual de ${SITE.name}.`);

export function SidebarVigencia({ collapsed }: { collapsed: boolean }) {
  const left = daysLeft(SITE.vigenciaHasta);
  const expired = left < 0;
  const urgent = left <= 7;

  if (collapsed) {
    return (
      <a
        href={renewUrl()}
        target="_blank"
        rel="noopener noreferrer"
        title={
          expired
            ? "Suscripción vencida — renovar con Angel"
            : `Vigencia: ${left} días — renovar con Angel`
        }
        className={`grid h-10 w-10 place-items-center rounded-xl border ${
          urgent
            ? "border-neg/40 bg-neg/10 text-neg"
            : "border-line bg-card-soft text-brand"
        }`}
      >
        {urgent ? <AlertTriangle className="h-4 w-4" /> : <CalendarClock className="h-4 w-4" />}
      </a>
    );
  }

  return (
    <div
      className={`rounded-xl border p-3 ${
        urgent ? "border-neg/40 bg-neg/5" : "border-line bg-card-soft/60"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
            urgent ? "bg-neg/15 text-neg" : "bg-brand-soft text-brand"
          }`}
        >
          {urgent ? <AlertTriangle className="h-3.5 w-3.5" /> : <CalendarClock className="h-3.5 w-3.5" />}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted">Suscripción</p>
          <p className="truncate text-xs font-semibold text-white">
            {expired ? "Vencida" : `${left} ${left === 1 ? "día" : "días"} restantes`}
          </p>
        </div>
      </div>
      {!expired && (
        <p className="mt-2 text-[11px] text-muted">Vigente hasta el {formatShort(SITE.vigenciaHasta)}</p>
      )}
      <a
        href={renewUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium ${
          urgent
            ? "bg-brand text-black hover:bg-brand-hover"
            : "border border-line text-muted hover:text-white"
        }`}
      >
        <RefreshCw className="h-3.5 w-3.5" /> Renovar con Angel
      </a>
    </div>
  );
}
