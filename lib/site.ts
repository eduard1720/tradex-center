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

  /* --- Testimonios de alumnos (edita / agrega los reales) ----------------- */
  testimonials: [
    {
      name: "Carla M.",
      role: "Alumna desde 2025",
      text:
        "Llegué sin saber nada de trading y con Angel aprendí a leer el mercado paso a paso. Sus clases son claras y siempre responde las dudas en vivo.",
    },
    {
      name: "José R.",
      role: "Trader principiante",
      text:
        "Lo mejor es el orden por módulos: no avanzas hasta entender lo anterior. Eso me dio una base sólida que antes no tenía.",
    },
    {
      name: "Daniela P.",
      role: "Alumna activa",
      text:
        "Angel explica con paciencia y de verdad le importa que aprendas. Las sesiones en vivo y la comunidad de WhatsApp valen muchísimo.",
    },
    {
      name: "Marco V.",
      role: "Operando 6 meses",
      text:
        "Pasé de operar por impulso a tener un plan y gestionar mi riesgo. Su forma de enseñar la psicología del trading me cambió por completo.",
    },
  ],
};

/** Construye un link wa.me con mensaje opcional pre-cargado. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
