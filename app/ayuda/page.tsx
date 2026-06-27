import { LifeBuoy, Mail, MessageCircle, Clock } from "lucide-react";
import { SITE, waLink } from "@/lib/site";

export const metadata = { title: "Ayuda — TradeX Center" };

// Horario de atención (solo mensajes) con equivalencias por zona horaria.
const SUPPORT_HOURS = [
  { zone: "Bolivia · Venezuela", hours: "10:00–11:00 · 13:00–14:00" },
  { zone: "Colombia · Perú · Ecuador", hours: "09:00–10:00 · 12:00–13:00" },
  { zone: "México (CDMX)", hours: "08:00–09:00 · 11:00–12:00" },
  { zone: "Argentina · Chile · Uruguay", hours: "11:00–12:00 · 14:00–15:00" },
];

const supportUrl = waLink(
  `Hola Angel, necesito ayuda con la plataforma de ${SITE.name}.`
);

const FAQS = [
  {
    q: "¿Cómo subo una clase grabada?",
    a: "Ve a “Subir clase” en el menú de instructor, sube tu video a YouTube o Vimeo (puede ser oculto/no listado) y pega el link. La miniatura y el reproductor se generan solos.",
  },
  {
    q: "¿Los estudiantes pueden ver clases ocultas de YouTube?",
    a: "Sí. Los videos “no listados” no aparecen en búsquedas de YouTube, pero se reproducen perfectamente dentro de la plataforma con el link.",
  },
  {
    q: "¿Puedo organizar las clases por temas?",
    a: "Cada clase tiene una categoría y nivel. En “Rutas” se agrupan automáticamente por tema para que el alumno siga un camino ordenado.",
  },
  {
    q: "¿Esto es asesoría financiera?",
    a: "No. Todo el contenido es educativo. El trading conlleva riesgo de pérdida de capital.",
  },
];

export default function AyudaPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="inline-flex items-center gap-1.5 text-sm text-brand">
          <LifeBuoy className="h-4 w-4" /> Centro de ayuda
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          ¿En qué te ayudamos?
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {FAQS.map((f) => (
            <details key={f.q} className="card group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                {f.q}
                <span className="text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 text-white">
              <Clock className="h-5 w-5 text-brand" />
              <h2 className="text-base font-semibold">Horario de atención</h2>
            </div>
            <p className="mt-2 text-sm text-muted">
              Soporte <strong className="text-white/90">solo por mensajes</strong>, todos los días
              en estas dos franjas:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {SUPPORT_HOURS.map((h) => (
                <li
                  key={h.zone}
                  className="flex items-start justify-between gap-3 border-b border-line pb-2 last:border-0"
                >
                  <span className="text-muted">{h.zone}</span>
                  <span className="text-right font-medium text-white">{h.hours}</span>
                </li>
              ))}
            </ul>
            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-4 w-full"
            >
              <MessageCircle className="h-4 w-4" /> Escribir por WhatsApp
            </a>
            <a href="mailto:soporte@hurtadotrader.com" className="btn-ghost mt-2 w-full">
              <Mail className="h-4 w-4" /> soporte@hurtadotrader.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
