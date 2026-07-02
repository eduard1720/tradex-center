"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";
import { useAdmin, logoutAdmin } from "@/lib/admin";

/**
 * Indicador de modo instructor (Angel).
 * Para los alumnos no muestra nada: el acceso de Angel ahora se hace
 * desde la misma pantalla de login (escribiendo su clave).
 */
export function AdminControl({ collapsed }: { collapsed: boolean }) {
  const isAdmin = useAdmin();
  const router = useRouter();

  if (!isAdmin) return null;

  function exit() {
    logoutAdmin();
    router.refresh();
  }

  if (collapsed) {
    return (
      <button
        onClick={exit}
        title="Modo Angel activo · salir"
        className="grid h-10 w-10 place-items-center rounded-xl border border-brand/40 bg-brand-soft text-brand"
      >
        <ShieldCheck className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-brand/40 bg-brand-soft px-3 py-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand">
        <ShieldCheck className="h-4 w-4" /> Modo Angel
      </span>
      <button
        onClick={exit}
        title="Salir del modo administrador"
        className="text-muted hover:text-white"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
