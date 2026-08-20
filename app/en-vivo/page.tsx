import { Radio, ArrowUpRight, CalendarClock } from "lucide-react";
import { waLink } from "@/lib/site";
import { getLiveSessions } from "@/lib/live";
import { LiveAdmin } from "@/components/LiveAdmin";
import { LiveCountdown } from "@/components/LiveCountdown";
import { LiveNotifyButtons } from "@/components/LiveNotifyButtons";
import { LiveStreamPlayer } from "@/components/LiveStreamPlayer";
import { LiveChat } from "@/components/LiveChat";

export const metadata = { title: "Clases en vivo — TradeX Center" };
export const dynamic = "force-dynamic";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EnVivoPage() {
  const sessions = await getLiveSessions();
  const now = Date.now();
  // Próximas (incluye las que empezaron hace menos de 2h).
  const upcoming = sessions.filter(
    (s) => new Date(s.startsAt).getTime() >= now - 2 * 60 * 60 * 1000
  );
  const next = upcoming[0];
  const live = sessions.find((s) => s.isLive);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Clases en vivo
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Análisis del mercado en directo, resolución de dudas y operativa en tiempo real.
        </p>
      </div>

      {live && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <LiveStreamPlayer isLive title={live.title} />
          </div>
          <LiveChat sessionId={live.id} />
        </div>
      )}

      {/* Sesiones programadas: una card por cada una, igual que "clase 2" */}
      {upcoming.length > 0 ? (
        upcoming.map((s, i) => (
          <div key={s.id} className="card relative overflow-hidden p-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-neg/15 px-2.5 py-1 text-xs font-medium text-neg">
              <Radio className="h-3.5 w-3.5" />
              {i === 0 ? "Próxima sesión en vivo" : "Sesión en vivo"}
            </span>

            <h2 className="mt-3 text-lg font-semibold text-white">{s.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm capitalize text-muted">
              <CalendarClock className="h-4 w-4" /> {formatWhen(s.startsAt)} (hora Bolivia)
            </p>

            <LiveCountdown startsAt={s.startsAt} />

            <a
              href={s.link || waLink(`Hola Angel, quiero el enlace de la clase "${s.title}".`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4"
            >
              {s.link ? "Unirme a la sesión" : "Pedir el enlace por WhatsApp"}
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <LiveNotifyButtons title={s.title} startsAt={s.startsAt} link={s.link} />
          </div>
        ))
      ) : (
        <div className="card relative overflow-hidden p-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neg/15 px-2.5 py-1 text-xs font-medium text-neg">
            <Radio className="h-3.5 w-3.5" /> Próxima sesión en vivo
          </span>
          <h2 className="mt-3 text-lg font-semibold text-white">Aún no hay una sesión programada</h2>
          <p className="mt-1 text-sm text-muted">
            Escríbele a Angel para conocer la fecha de la próxima clase en vivo.
          </p>
          <a
            href={waLink("Hola Angel, ¿cuándo es la próxima clase en vivo?")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4"
          >
            Consultar por WhatsApp <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* Panel de administrador (solo visible para Angel) */}
      <LiveAdmin sessions={sessions} />
    </div>
  );
}
