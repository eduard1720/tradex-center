"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Check, Lock } from "lucide-react";
import { SITE, waLink } from "@/lib/site";
import { useAdmin } from "@/lib/admin";

const PLAN_FEATURES = [
  "Acceso a todos los módulos de clases",
  "Clases en vivo semanales con Angel",
  "Comunidad privada de WhatsApp",
  "Herramientas: PDFs, libros y material",
];

function isExpired(): boolean {
  return Date.now() > new Date(SITE.vigenciaHasta + "T23:59:59").getTime();
}

/**
 * Bloquea el acceso cuando la suscripción venció y muestra la membresía
 * mensual. Angel (modo admin) queda exento. Sin vencer, no se muestra nada.
 */
export function AccessGate({ children }: { children: React.ReactNode }) {
  const isAdmin = useAdmin();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    setBlocked(isExpired() && !isAdmin);
  }, [isAdmin]);

  const renewUrl = waLink(
    `Hola Angel, quiero renovar mi suscripción a ${SITE.name} (${SITE.price}).`
  );

  return (
    <>
      {children}
      {blocked && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-bg/80 p-4 backdrop-blur-md">
          <div className="card w-full max-w-md p-7 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-neg/15 text-neg">
              <Lock className="h-7 w-7" />
            </span>
            <h2 className="mt-4 text-xl font-semibold text-white">Tu suscripción venció</h2>
            <p className="mt-1 text-sm text-muted">
              Renueva tu membresía mensual para seguir accediendo a las clases, las sesiones
              en vivo y el material.
            </p>

            <div className="mt-5 rounded-2xl border border-line bg-card-soft p-5 text-left">
              <p className="text-sm text-muted">Membresía mensual</p>
              <p className="mt-1 text-3xl font-semibold text-white">{SITE.price}</p>
              <ul className="mt-4 space-y-2.5">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-white/90">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-pos" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={renewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-5 w-full"
            >
              <MessageCircle className="h-4 w-4" /> Renovar por WhatsApp
            </a>
            <p className="mt-2 text-[11px] text-muted">
              Coordina el pago directamente con Angel para reactivar tu acceso.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
