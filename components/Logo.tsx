import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-brand shadow-glow">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-black" fill="none">
          <path
            d="M5 16V8.5L12 4l7 4.5V16l-7 4.5L5 16Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 14.5l2.5-3 2 2.2 2.5-3.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight text-white">
            Hurtado<span className="text-brand">Trader</span>
          </span>
          <span className="block text-[10px] uppercase tracking-[0.18em] text-muted">
            Academy
          </span>
        </span>
      )}
    </Link>
  );
}
