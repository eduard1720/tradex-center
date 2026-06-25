import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

/**
 * Logo de TradeX Center a partir de la imagen de marca (public/logo.jpeg).
 * Se recorta por CSS el texto inferior ("¿por qué TradeX Center?").
 * 👉 Para máxima nitidez, reemplaza public/logo.jpeg por un PNG con fondo
 *    transparente y solo el logo.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    // Cuadro pequeño enfocado en la "X" (sidebar colapsado / móvil).
    return (
      <Link href="/" className="block">
        <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[#0d0d0d]">
          <img
            src="/logo.jpeg"
            alt="TradeX Center"
            className="absolute max-w-none"
            style={{ width: 65, left: -14, top: 0 }}
          />
        </span>
      </Link>
    );
  }

  // Lockup completo (X + TRADEX CENTER), recortando la frase inferior.
  return (
    <Link href="/" className="block">
      <span
        className="relative block w-[150px] overflow-hidden rounded-md"
        style={{ aspectRatio: "150 / 96" }}
      >
        <img src="/logo.jpeg" alt="TradeX Center" className="block w-full" />
      </span>
    </Link>
  );
}
