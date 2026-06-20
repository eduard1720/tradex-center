import { LifeBuoy, Mail, MessageCircle, BookOpen } from "lucide-react";

export const metadata = { title: "Ayuda — Hurtado Trader Academy" };

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
            <h2 className="text-base font-semibold text-white">Contacto</h2>
            <p className="mt-1 text-sm text-muted">¿Necesitas ayuda directa?</p>
            <a href="mailto:soporte@hurtadotrader.com" className="btn-ghost mt-3 w-full">
              <Mail className="h-4 w-4" /> soporte@hurtadotrader.com
            </a>
            <button className="btn-primary mt-2 w-full">
              <MessageCircle className="h-4 w-4" /> Chat con soporte
            </button>
          </div>
          <div className="card p-5">
            <BookOpen className="h-6 w-6 text-brand" />
            <h2 className="mt-2 text-base font-semibold text-white">Guía de inicio</h2>
            <p className="mt-1 text-sm text-muted">
              Aprende a usar la plataforma en 5 minutos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
