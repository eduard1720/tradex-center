import { Radio, ArrowUpRight, CalendarClock, Video } from "lucide-react";
import { waLink } from "@/lib/site";
import { getLiveSessions } from "@/lib/live";
import { LiveAdmin } from "@/components/LiveAdmin";
import { LiveCountdown } from "@/components/LiveCountdown";
import { LiveNotifyButtons } from "@/components/LiveNotifyButtons";

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

      {/* Próxima sesión */}
      <div className="card relative overflow-hidden p-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neg/15 px-2.5 py-1 text-xs font-medium text-neg">
          <Radio className="h-3.5 w-3.5" /> Próxima sesión en vivo
        </span>
        {next ? (
          <>
            <h2 className="mt-3 text-lg font-semibold text-white">{next.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm capitalize text-muted">
              <CalendarClock className="h-4 w-4" /> {formatWhen(next.startsAt)} (hora Bolivia)
            </p>

            <LiveCountdown startsAt={next.startsAt} />

            <a
              href={
                next.link ||
                waLink("Hola Angel, quiero el enlace de la próxima clase en vivo.")
              }
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4"
            >
              {next.link ? "Unirme a la sesión" : "Pedir el enlace por WhatsApp"}
              <ArrowUpRight className="h-4 w-4" />
            </a>

            <LiveNotifyButtons title={next.title} startsAt={next.startsAt} link={next.link} />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Lista de próximas sesiones */}
      {upcoming.length > 1 && (
        <div className="card p-5">
          <h2 className="mb-3 text-base font-semibold text-white">Próximas sesiones</h2>
          <ul className="divide-y divide-line">
            {upcoming.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
                    <Video className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-white">{s.title}</p>
                    <p className="text-xs capitalize text-muted">{formatWhen(s.startsAt)}</p>
                  </div>
                </div>
                {s.link && (
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost !py-1.5 text-sm"
                  >
                    Entrar <ArrowUpRight className="h-4 w-4" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Panel de administrador (solo visible para Angel) */}
      <LiveAdmin sessions={sessions} />
    </div>
  );
}
