"use client";

import { UserRound, LogOut, MessageCircle } from "lucide-react";
import { SITE, waLink } from "@/lib/site";
import { useAdmin } from "@/lib/admin";
import { useStudent, logoutStudent } from "@/lib/student";

const supportUrl = () =>
  waLink(`Hola Angel, soy alumno de ${SITE.name} y necesito ayuda con mi cuenta.`);

/** Tarjeta de cuenta del alumno en el sidebar (nombre + cerrar sesión). */
export function SidebarVigencia({ collapsed }: { collapsed: boolean }) {
  const isAdmin = useAdmin();
  const student = useStudent();

  // En modo instructor no se muestra la tarjeta de alumno (Angel usa AdminControl).
  if (isAdmin || !student) return null;

  if (collapsed) {
    return (
      <button
        onClick={logoutStudent}
        title={`${student.name} — cerrar sesión`}
        className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card-soft text-brand"
      >
        <UserRound className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-card-soft/60 p-3">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
          <UserRound className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted">Alumno</p>
          <p className="truncate text-xs font-semibold text-white">{student.name}</p>
        </div>
      </div>
      <a
        href={supportUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-1.5 rounded-lg border border-line px-2 py-1.5 text-xs font-medium text-muted hover:text-white"
      >
        <MessageCircle className="h-3.5 w-3.5" /> Soporte
      </a>
      <button
        onClick={logoutStudent}
        className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-muted hover:text-white"
      >
        <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
      </button>
    </div>
  );
}
