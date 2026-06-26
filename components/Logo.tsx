import Link from "next/link";

/* eslint-disable @next/next/no-img-element */

/**
 * Logo de TradeX Center (public/logo.png — lockup horizontal limpio).
 * Expandido: el lockup completo. Colapsado: recorte a la "X" (lado derecho).
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link href="/" className="block">
        <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-xl bg-[#0d0d0d]">
          <img
            src="/logo.png"
            alt="TradeX Center"
            className="h-full w-full object-cover"
            style={{ objectPosition: "92% 50%" }}
          />
        </span>
      </Link>
    );
  }

  return (
    <Link href="/" className="block">
      <img src="/logo.png" alt="TradeX Center" className="h-auto w-[160px]" />
    </Link>
  );
}
