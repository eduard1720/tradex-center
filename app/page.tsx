import Link from "next/link";
import { ArrowUpRight, Radio, Check, MessageCircle, Quote, Star } from "lucide-react";
import { ClassCard } from "@/components/ClassCard";
import { SocialLinks } from "@/components/SocialLinks";
import { getAllClasses } from "@/lib/data";
import { SITE, waLink } from "@/lib/site";

export const dynamic = "force-dynamic";

const PLAN_FEATURES = [
  "Acceso a todos los módulos de clases",
  "Clases en vivo semanales con Angel",
  "Comunidad privada de WhatsApp",
  "Análisis y noticias del mercado",
];

export default async function DashboardPage() {
  const classes = await getAllClasses();
  const recent = classes.filter((c) => c.module > 0).slice(0, 3);
  const live = classes.find((c) => c.category === "En Vivo");

  const subscribeUrl = waLink(
    `Hola Angel, quiero suscribirme a ${SITE.name} (${SITE.price}).`
  );

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Bienvenido a {SITE.name} 👋</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Inicio
          </h1>
        </div>
        <a href={subscribeUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          <MessageCircle className="h-4 w-4" /> Suscribirme
        </a>
      </div>

      {/* Historia de Angel + suscripción */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Sobre Angel */}
        <div className="card relative overflow-hidden p-6 lg:col-span-2">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand/15 blur-3xl" />
          <span className="chip">Sobre Angel Hurtado</span>
          <h2 className="mt-3 text-xl font-semibold text-white md:text-2xl">
            De operar en mi cuarto a formar a cientos de traders
          </h2>
          {/* 👉 Angel: reemplaza este texto con tu historia real. */}
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted">
            <p>
              Empecé hace más de 8 años como autodidacta, perdiendo y aprendiendo en los
              mercados de Forex y cripto. Tras años de disciplina, gestión de riesgo y
              miles de horas frente a los gráficos, logré la consistencia que buscaba.
            </p>
            <p>
              Hoy mi misión es acortarte el camino: enseñarte lo que a mí me costó años
              descubrir, con un método claro, paso a paso y acompañándote en vivo.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="text-xs text-muted">Sígueme en mis redes:</span>
            <SocialLinks />
          </div>
        </div>

        {/* Plan de suscripción */}
        <div className="card flex flex-col p-6">
          <p className="text-sm text-muted">Membresía mensual</p>
          <div className="mt-1 flex items-end gap-1">
            <span className="text-3xl font-semibold tracking-tight text-white">{SITE.price}</span>
          </div>
          <ul className="mt-4 flex-1 space-y-2.5">
            {PLAN_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-white/90">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-pos" /> {f}
              </li>
            ))}
          </ul>
          <a
            href={subscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-5 w-full"
          >
            <MessageCircle className="h-4 w-4" /> Suscribirme por WhatsApp
          </a>
          <p className="mt-2 text-center text-[11px] text-muted">
            Coordina el pago directamente con Angel.
          </p>
        </div>
      </div>

      {/* Acceso a clases en vivo */}
      <Link
        href="/en-vivo"
        className="card group relative flex flex-wrap items-center justify-between gap-4 overflow-hidden p-5 transition-colors hover:border-brand/40"
      >
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-brand/20 blur-2xl" />
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-neg/15 px-2.5 py-1 text-xs font-medium text-neg">
            <Radio className="h-3.5 w-3.5" /> Próxima en vivo
          </span>
          <h3 className="mt-3 text-base font-semibold text-white">
            {live ? live.title : "Sesiones en directo con Angel"}
          </h3>
          <p className="mt-1 text-xs text-muted">
            Reserva tu lugar para la próxima sesión con Angel.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand">
          Ver clases en vivo <ArrowUpRight className="h-4 w-4" />
        </span>
      </Link>

      {/* Testimonios de alumnos */}
      <div className="space-y-4">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm text-brand">
            <Star className="h-4 w-4 fill-brand" /> Historias de alumnos
          </p>
          <h2 className="text-lg font-semibold text-white">Lo que dicen de Angel</h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SITE.testimonials.map((t) => (
            <div key={t.name} className="card relative p-6">
              <Quote className="absolute right-5 top-5 h-8 w-8 text-brand/15" />
              <p className="text-sm leading-relaxed text-white/90">“{t.text}”</p>
              <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/20 text-sm font-bold text-brand">
                  {t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-white">{t.name}</p>
                  <p className="text-xs text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clases recientes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Clases recientes</h2>
          <Link href="/clases" className="text-sm text-brand hover:text-brand-hover">
            Ver módulos →
          </Link>
        </div>
        {recent.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((c) => (
              <ClassCard key={c.id} cls={c} />
            ))}
          </div>
        ) : (
          <div className="card grid place-items-center py-12 text-center">
            <p className="text-muted">Aún no hay clases publicadas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
