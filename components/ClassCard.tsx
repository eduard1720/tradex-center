import Link from "next/link";
import Image from "next/image";
import { Play, Clock, BarChart3 } from "lucide-react";
import type { TradingClass } from "@/lib/types";

const levelTone: Record<string, string> = {
  Principiante: "text-pos border-pos/30 bg-pos/10",
  Intermedio: "text-brand border-brand/30 bg-brand/10",
  Avanzado: "text-neg border-neg/30 bg-neg/10",
};

export function ClassCard({ cls, progress }: { cls: TradingClass; progress?: number }) {
  return (
    <Link
      href={`/clases/${cls.id}`}
      className="group card overflow-hidden transition-all hover:border-white/15 hover:bg-card-hover"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-card-soft to-bg">
        {cls.thumbnail ? (
          <Image
            src={cls.thumbnail}
            alt={cls.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted">
            <Play className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/10" />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
          {cls.category}
        </span>
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
          <Clock className="h-3 w-3" /> {cls.durationMin} min
        </span>
        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-brand text-black shadow-glow">
            <Play className="h-6 w-6 fill-black" />
          </span>
        </span>
        {typeof progress === "number" && (
          <span className="absolute bottom-0 left-0 h-1 bg-brand" style={{ width: `${progress}%` }} />
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${levelTone[cls.level]}`}>
            {cls.level}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <BarChart3 className="h-3 w-3" /> {cls.tags[0] ?? "trading"}
          </span>
        </div>
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-white transition-colors group-hover:text-brand">
          {cls.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs text-muted">{cls.description}</p>
        <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/20 text-[10px] font-bold text-brand">
            {cls.instructor.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </span>
          <span className="text-xs text-muted">{cls.instructor}</span>
        </div>
      </div>
    </Link>
  );
}
