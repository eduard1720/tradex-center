import { CalendarClock, AlertTriangle, ArrowUpRight } from "lucide-react";
import { SITE, waLink } from "@/lib/site";

function daysLeft(date: string): number {
  const end = new Date(date + "T23:59:59").getTime();
  const now = Date.now();
  return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
}

function formatDate(date: string): string {
  return new Date(date + "T00:00:00").toLocaleDateString("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function VigenciaBanner() {
  const left = daysLeft(SITE.vigenciaHasta);
  const expired = left < 0;
  const urgent = left <= 7; // por vencer o vencido

  const renewUrl = waLink(
    `Hola Angel, quiero renovar mi suscripción mensual de ${SITE.name}.`
  );

  return (
    <div
      className={`card flex flex-wrap items-center justify-between gap-4 p-5 ${
        urgent ? "border-neg/40 bg-neg/5" : "border-line"
      }`}
    >
      <div className="flex items-center gap-3.5">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
            urgent ? "bg-neg/15 text-neg" : "bg-brand-soft text-brand"
          }`}
        >
          {urgent ? <AlertTriangle className="h-5 w-5" /> : <CalendarClock className="h-5 w-5" />}
        </span>
        <div>
          <p className="text-sm font-semibold text-white">
            {expired
              ? "Tu suscripción venció"
              : urgent
              ? `Tu suscripción vence en ${left} ${left === 1 ? "día" : "días"}`
              : `Suscripción activa · ${left} días restantes`}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {expired
              ? "Renueva para seguir accediendo a las clases. "
              : `Vigencia hasta el ${formatDate(SITE.vigenciaHasta)}. `}
            Los cursos son mensuales — habla con Angel para renovar.
          </p>
        </div>
      </div>
      <a
        href={renewUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={urgent ? "btn-primary shrink-0" : "btn-ghost shrink-0"}
      >
        Renovar con Angel <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  );
}
