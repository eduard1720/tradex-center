"use client";

import { useMemo, useState } from "react";
import {
  MessageCircle,
  ArrowUpRight,
  Users,
  Megaphone,
  Send,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useAdmin } from "@/lib/admin";
import { SITE, waLink, waGroupLink } from "@/lib/site";

/* --------------------------- Vista del alumno ----------------------------- */
function StudentCommunity() {
  const communityUrl =
    SITE.whatsappGroup ||
    waLink(`Hola Angel, quiero unirme a la comunidad de ${SITE.name}.`);

  return (
    <a
      href={communityUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="card group relative flex flex-col items-center gap-4 overflow-hidden p-10 text-center transition-colors hover:border-brand/40"
    >
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-black shadow-glow">
        <MessageCircle className="h-8 w-8" />
      </span>
      <div>
        <h2 className="text-xl font-semibold text-white">Únete al grupo de WhatsApp</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Comparte ideas, recibe avisos de las clases en vivo y resuelve tus dudas con Angel
          y el resto de la comunidad.
        </p>
      </div>
      <span className="btn-primary">
        Entrar a la comunidad <ArrowUpRight className="h-4 w-4" />
      </span>
      <p className="inline-flex items-center gap-1.5 text-xs text-muted">
        <Users className="h-3.5 w-3.5" /> Solo para miembros activos
      </p>
    </a>
  );
}

/* --------------------------- Gestión (Angel) ------------------------------ */
const TEMPLATES: { label: string; text: string }[] = [
  {
    label: "Nueva clase publicada",
    text: `📚 Nueva clase disponible en ${SITE.name}. Entra a la plataforma y complétala.`,
  },
  {
    label: "Recordatorio de clase en vivo",
    text: `🔴 Hoy tenemos clase en vivo en ${SITE.name}. ¡No faltes!`,
  },
  {
    label: "Motivación semanal",
    text: `💪 Recuerda revisar tus clases pendientes esta semana. La constancia es lo que marca la diferencia.`,
  },
];

function AdminCommunity() {
  const [message, setMessage] = useState("");
  const hasGroup = Boolean(SITE.whatsappGroup);

  const sendUrl = useMemo(
    () => waGroupLink(message.trim() || undefined),
    [message]
  );

  return (
    <div className="space-y-5">
      {/* Acceso al grupo */}
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-black shadow-glow">
            <MessageCircle className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-white">Grupo de la comunidad</h2>
            <p className="text-sm text-muted">
              {hasGroup
                ? "Abre el grupo de WhatsApp para moderar o publicar."
                : "Aún no has configurado el enlace del grupo (se abrirá tu chat directo)."}
            </p>
          </div>
        </div>
        <a
          href={hasGroup ? SITE.whatsappGroup : waLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost shrink-0 justify-center"
        >
          Abrir grupo <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      {/* Aviso al grupo */}
      <div className="card p-6">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-brand" />
          <h2 className="text-base font-semibold text-white">Enviar aviso a la comunidad</h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Escribe el mensaje y ábrelo en WhatsApp con el texto listo. No se envía solo:
          tú lo mandas al grupo cuando quieras.
        </p>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Ej: Nueva clase disponible en la plataforma…"
          className="input mt-4 min-h-[110px] resize-y"
        />

        {/* Plantillas rápidas */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted">
            <Sparkles className="h-3.5 w-3.5" /> Plantillas
          </span>
          {TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => setMessage(t.text)}
              className="rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors hover:border-brand/40 hover:text-white"
            >
              {t.label}
            </button>
          ))}
        </div>

        {!hasGroup && (
          <p className="mt-4 inline-flex items-start gap-1.5 text-xs text-muted">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
            Para enviar directo al grupo, configura <code className="text-white/80">whatsappGroup</code>{" "}
            en <code className="text-white/80">lib/site.ts</code>.
          </p>
        )}

        <div className="mt-5 border-t border-line pt-4">
          <a
            href={sendUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            <Send className="h-4 w-4" /> Abrir en WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

export function CommunityView() {
  const isAdmin = useAdmin();
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          {isAdmin ? "Gestión de comunidad" : "Comunidad"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isAdmin
            ? "Modera el grupo y envía avisos a tus alumnos por WhatsApp."
            : "El grupo privado de alumnos de Angel."}
        </p>
      </div>

      {isAdmin ? <AdminCommunity /> : <StudentCommunity />}
    </div>
  );
}
