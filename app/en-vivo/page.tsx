import { Radio, ArrowUpRight, CalendarClock, Video } from "lucide-react";
import { waLink } from "@/lib/site";

export const metadata = { title: "Clases en vivo — TradeX Center" };

export default function EnVivoPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-sm text-muted">Sesiones en directo con Angel</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Clases en vivo
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Análisis del mercado en directo, resolución de dudas y operativa en tiempo real.
        </p>
      </div>

      {/* Banner próxima sesión */}
      <div className="card relative overflow-hidden p-6">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neg/15 px-2.5 py-1 text-xs font-medium text-neg">
          <Radio className="h-3.5 w-3.5" /> Próxima sesión en vivo
        </span>
        <h2 className="mt-3 text-lg font-semibold text-white">Análisis semanal del mercado</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
          <CalendarClock className="h-4 w-4" /> Todos los domingos · 19:00 (hora Bolivia)
        </p>
        <a
          href={waLink("Hola Angel, quiero el enlace de la próxima clase en vivo.")}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-4"
        >
          Pedir el enlace por WhatsApp <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      {/* Cómo funciona */}
      <div className="card flex items-start gap-4 p-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
          <Video className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-white">¿Cómo me uno?</h3>
          <p className="mt-1 text-sm text-muted">
            Las sesiones en vivo se transmiten para los miembros activos. Pide el enlace por
            WhatsApp y Angel te lo comparte antes de cada sesión.
          </p>
        </div>
      </div>
    </div>
  );
}
