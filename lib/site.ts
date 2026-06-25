/* -------------------------------------------------------------------------- */
/*  Configuración central del sitio                                           */
/*  👉 Angel: cambia estos valores con tus datos reales.                      */
/* -------------------------------------------------------------------------- */

export const SITE = {
  /** Nombre de la plataforma. */
  name: "TradeX Center",
  tagline: "Academia de trading",

  /** Precio de la suscripción mensual (texto libre). */
  price: "Bs 350 / mes",

  /* --- WhatsApp ----------------------------------------------------------- */
  /** Número de Angel en formato internacional, SIN +, espacios ni guiones. */
  whatsappNumber: "59175541308",
  /** Link directo al GRUPO de WhatsApp de la comunidad (botón "Comunidad").
   *  Si lo dejas en "", el botón abre el chat directo con Angel. */
  whatsappGroup: "",

  /* --- Redes sociales (deja en "" para ocultar) --------------------------- */
  social: {
    instagram: "https://www.instagram.com/angelhurtado_p",
    tiktok: "",
    youtube: "https://www.youtube.com/@angelhurtado_p",
    telegram: "",
    x: "",
    linktree: "https://linktr.ee/angelhurtado_p",
  },

  /* --- Vigencia de la suscripción ----------------------------------------- */
  /** Fecha (YYYY-MM-DD) en que vence el curso mensual del alumno.
   *  Provisional: en producción esto saldría de la cuenta del alumno. */
  vigenciaHasta: "2026-07-25",
};

/** Construye un link wa.me con mensaje opcional pre-cargado. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
