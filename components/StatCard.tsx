import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  positive = true,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {delta && (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              positive ? "bg-pos/10 text-pos" : "bg-neg/10 text-neg"
            }`}
          >
            {delta}
          </span>
        )}
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-white">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
