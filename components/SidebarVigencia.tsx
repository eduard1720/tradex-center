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
    <div className="px-1">
      <div className="flex items-center gap-2.5 px-2 py-1.5">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-card-soft text-muted">
          <UserRound className="h-3.5 w-3.5" />
        </span>
        <p className="min-w-0 truncate text-xs font-medium text-white/80">{student.name}</p>
      </div>
      <div className="flex items-center gap-1">
        <a
          href={supportUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted/70 transition-colors hover:bg-card-hover hover:text-white"
        >
          <MessageCircle className="h-3.5 w-3.5" /> Soporte
        </a>
        <button
          onClick={logoutStudent}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium text-muted/70 transition-colors hover:bg-card-hover hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" /> Salir
        </button>
      </div>
    </div>
  );
}
