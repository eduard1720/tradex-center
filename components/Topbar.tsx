"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Search, Bell, Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { useAdmin } from "@/lib/admin";
import { MAIN_NAV, ADMIN_NAV } from "@/lib/nav";

const CHIPS = [
  { label: "Clases", value: "48", tone: "muted" as const },
  { label: "Estudiantes", value: "1.2k", tone: "pos" as const },
  { label: "BTC", value: "$88,248", tone: "pos" as const },
];

export function Topbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin = useAdmin();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        {/* Mobile menu + logo */}
        <button
          onClick={() => setOpen(true)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted md:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="md:hidden">
          <Logo compact />
        </div>

        {/* Stat chips */}
        <div className="hidden items-center gap-2 lg:flex">
          {CHIPS.map((c) => (
            <span key={c.label} className="chip">
              <span className="text-muted">{c.label}</span>
              <span
                className={
                  c.tone === "pos" ? "text-pos font-medium" : "text-white font-medium"
                }
              >
                {c.value}
              </span>
            </span>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <div className="relative hidden sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              placeholder="Buscar clases..."
              className="h-10 w-44 rounded-xl border border-line bg-card-soft pl-9 pr-3 text-sm text-white placeholder:text-muted/70 outline-none focus:border-brand/50 lg:w-64"
            />
          </div>

          <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-line text-muted hover:text-white">
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-brand ring-2 ring-bg" />
          </button>

          <button className="flex items-center gap-2 rounded-xl border border-line bg-card-soft px-2.5 py-1.5 text-sm">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand/20 text-xs font-bold text-brand">
              AH
            </span>
            <span className="hidden text-white/90 sm:block">Angel H.</span>
            <ChevronDown className="hidden h-4 w-4 text-muted sm:block" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-line bg-bg-soft p-4">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)} className="text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {[...MAIN_NAV, ...(isAdmin ? ADMIN_NAV : [])].map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                      active ? "bg-brand-soft text-white" : "text-muted"
                    }`}
                  >
                    <Icon className={`h-[18px] w-[18px] ${active ? "text-brand" : ""}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
