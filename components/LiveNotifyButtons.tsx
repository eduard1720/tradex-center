"use client";

import { Megaphone, BellRing } from "lucide-react";
import { useAdmin } from "@/lib/admin";
import { SITE, waGroupLink } from "@/lib/site";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("es-BO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Botones (solo Angel) para avisar a la comunidad por WhatsApp. No envían nada
 * automáticamente: abren WhatsApp con el mensaje pre-cargado para que Angel lo
 * mande al grupo cuando quiera.
 */
export function LiveNotifyButtons({
  title,
  startsAt,
  link,
}: {
  title: string;
  startsAt: string;
  link?: string;
}) {
  const isAdmin = useAdmin();
  if (!isAdmin) return null;

  const linkLine = link ? `\nEnlace: ${link}` : "";

  const announce = waGroupLink(
    `📢 Clase en vivo en ${SITE.name}:\n"${title}"\n🗓️ ${formatWhen(startsAt)} (hora Bolivia)${linkLine}`
  );
  const starting = waGroupLink(
    `🔴 ¡La clase en vivo "${title}" está por comenzar! Entra ahora.${linkLine}`
  );

  return (
    <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
      <span className="w-full text-[11px] uppercase tracking-wider text-muted">
        Avisar a la comunidad (WhatsApp)
      </span>
      <a href={announce} target="_blank" rel="noopener noreferrer" className="btn-ghost">
        <Megaphone className="h-4 w-4" /> Avisar al grupo
      </a>
      <a href={starting} target="_blank" rel="noopener noreferrer" className="btn-primary">
        <BellRing className="h-4 w-4" /> La clase está por comenzar
      </a>
    </div>
  );
}
