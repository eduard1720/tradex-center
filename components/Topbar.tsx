"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useAdmin, logoutAdmin } from "@/lib/admin";
import { useStudent, logoutStudent } from "@/lib/student";
import { MAIN_NAV, ADMIN_NAV } from "@/lib/nav";

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export function Topbar() {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const isAdmin = useAdmin();
  const student = useStudent();

  const name = isAdmin ? "Angel H." : student?.name ?? "Alumno";

  function signOut() {
    if (isAdmin) logoutAdmin();
    logoutStudent();
    setMenu(false);
  }

  return (
    <>
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

        <div className="ml-auto flex items-center gap-2.5">
          <div className="relative">
            <button
              onClick={() => setMenu((m) => !m)}
              className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-white/[0.05]"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/15 text-[11px] font-semibold text-brand">
                {initials(name)}
              </span>
              <span className="hidden font-medium text-white/90 sm:block">{name}</span>
              <ChevronDown
                className={`hidden h-4 w-4 text-muted transition-transform duration-150 sm:block ${
                  menu ? "rotate-180" : ""
                }`}
              />
            </button>

            {menu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-line bg-bg-soft shadow-xl">
                  <div className="px-4 py-3">
                    <p className="truncate text-sm font-medium text-white">{name}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {isAdmin ? "Instructor" : "Alumno"}
                    </p>
                  </div>
                  <div className="h-px bg-line" />
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-white/90 transition-colors hover:bg-white/[0.05]"
                  >
                    <LogOut className="h-4 w-4 text-muted" /> Cerrar sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>

      {/* Menú móvil: fuera del <header> a propósito. El header usa
          backdrop-blur, que crea un containing block y rompía el
          position:fixed del panel (se recortaba al alto del header). */}
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 border-r border-line bg-bg-soft p-4">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)} className="text-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {[
                ...MAIN_NAV.filter((item) => !(isAdmin && item.href === "/herramientas")),
                ...(isAdmin ? ADMIN_NAV : []),
              ].map((item) => {
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
    </>
  );
}
