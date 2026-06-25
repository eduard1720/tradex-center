import Link from "next/link";
import { Radio, ArrowUpRight, CalendarClock } from "lucide-react";
import { ClassCard } from "@/components/ClassCard";
import { getAllClasses } from "@/lib/data";
import { waLink } from "@/lib/site";

export const metadata = { title: "Clases en vivo — TradeX Center" };
export const dynamic = "force-dynamic";

export default async function EnVivoPage() {
  const classes = await getAllClasses();
  const live = classes.filter((c) => c.category === "En Vivo");

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
        <h2 className="mt-3 text-lg font-semibold text-white">
          Análisis semanal del mercado
        </h2>
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

      {/* Grabaciones */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Sesiones grabadas</h2>
        {live.length === 0 ? (
          <div className="card grid place-items-center py-16 text-center">
            <p className="text-muted">Aún no hay sesiones en vivo grabadas.</p>
            <Link href="/clases" className="mt-3 text-sm text-brand hover:text-brand-hover">
              Ver clases por módulos →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((c) => (
              <ClassCard key={c.id} cls={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
