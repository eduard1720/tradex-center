"use client";

import { useState } from "react";

export function RangeTabs({
  options = ["1D", "1S", "1M", "1A", "Max"],
  initial = "1S",
}: {
  options?: string[];
  initial?: string;
}) {
  const [active, setActive] = useState(initial);
  return (
    <div className="flex items-center gap-1 rounded-xl border border-line bg-card-soft p-1">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => setActive(o)}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
            active === o ? "bg-brand text-black" : "text-muted hover:text-white"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
