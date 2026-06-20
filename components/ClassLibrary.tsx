"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ClassCard } from "./ClassCard";
import { CATEGORIES, LEVELS, type TradingClass } from "@/lib/types";

export function ClassLibrary({
  classes,
  initialCat = "Todas",
}: {
  classes: TradingClass[];
  initialCat?: string;
}) {
  const [cat, setCat] = useState<string>(initialCat);
  const [level, setLevel] = useState<string>("Todos");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return classes.filter((c) => {
      if (cat !== "Todas" && c.category !== cat) return false;
      if (level !== "Todos" && c.level !== level) return false;
      if (q.trim()) {
        const hay = `${c.title} ${c.description} ${c.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [classes, cat, level, q]);

  return (
    <div className="space-y-5">
      {/* Search + level */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por título, tema o etiqueta..."
            className="h-11 w-full rounded-xl border border-line bg-card-soft pl-10 pr-3 text-sm text-white placeholder:text-muted/70 outline-none focus:border-brand/50"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted" />
          {["Todos", ...LEVELS].map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                level === l
                  ? "border-brand/50 bg-brand-soft text-white"
                  : "border-line text-muted hover:text-white"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {["Todas", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              cat === c
                ? "border-brand bg-brand text-black"
                : "border-line bg-card-soft text-muted hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted">
        {filtered.length} {filtered.length === 1 ? "clase" : "clases"}
      </p>

      {filtered.length === 0 ? (
        <div className="card grid place-items-center py-16 text-center">
          <p className="text-muted">No hay clases que coincidan con tu búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((c) => (
            <ClassCard key={c.id} cls={c} />
          ))}
        </div>
      )}
    </div>
  );
}
