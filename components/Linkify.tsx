import { Fragment } from "react";

/* -------------------------------------------------------------------------- */
/*  Convierte en enlaces clicables las URLs que aparezcan dentro de un texto   */
/*  libre (p. ej. la descripción de una clase que escribe Angel).              */
/* -------------------------------------------------------------------------- */

// Captura http(s)://… y también dominios "pelados" tipo www.ejemplo.com
const URL_RE = /(\bhttps?:\/\/[^\s<]+|\bwww\.[^\s<]+)/gi;

function normalize(raw: string): { href: string; text: string } {
  // Quita puntuación final que no forma parte del enlace (., ), etc.)
  const trailing = raw.match(/[.,;:!?)\]]+$/)?.[0] ?? "";
  const clean = trailing ? raw.slice(0, -trailing.length) : raw;
  const href = clean.startsWith("http") ? clean : `https://${clean}`;
  return { href, text: clean };
}

export function Linkify({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((part, i) => {
        if (part && /^(https?:\/\/|www\.)/i.test(part)) {
          const { href, text: label } = normalize(part);
          const trailing = part.slice(label.length);
          return (
            <Fragment key={i}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="break-words font-medium text-brand underline decoration-brand/40 underline-offset-2 hover:text-brand-hover hover:decoration-brand"
              >
                {label}
              </a>
              {trailing}
            </Fragment>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}
