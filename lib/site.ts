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

};

/** Construye un link wa.me con mensaje opcional pre-cargado (chat directo con Angel). */
export function waLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Link para avisar a la comunidad por WhatsApp. Si hay grupo configurado abre el
 * grupo; si no, abre el chat directo con Angel con el mensaje pre-cargado.
 * (No envía nada automáticamente: Angel pulsa y manda el mensaje.)
 */
export function waGroupLink(message?: string): string {
  if (SITE.whatsappGroup) return SITE.whatsappGroup;
  return waLink(message);
}
