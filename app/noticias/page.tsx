import { ExternalLink, CalendarClock } from "lucide-react";
import { EconomicCalendar } from "@/components/EconomicCalendar";

export const metadata = { title: "Noticias — TradeX Center" };

const INVESTING_URL = "https://es.investing.com/economic-calendar/";

export default function NoticiasPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Noticias del mercado
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Eventos y datos de alto impacto de Estados Unidos que mueven al dólar (NFP, FOMC,
            IPC…). Revísalos antes de operar para evitar la volatilidad de las noticias.
          </p>
        </div>
        <a href={INVESTING_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          <ExternalLink className="h-4 w-4" /> Abrir Investing.com
        </a>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3 text-sm text-muted">
          <CalendarClock className="h-4 w-4 text-brand" />
          Calendario económico · Estados Unidos (dólar)
        </div>
        <div className="p-2">
          <EconomicCalendar />
        </div>
      </div>

      <p className="text-center text-xs text-muted">
        Calendario económico provisto por{" "}
        <a
          href={INVESTING_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 hover:text-white hover:underline"
        >
          Investing.com
        </a>
        .
      </p>
    </div>
  );
}
