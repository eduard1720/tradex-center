"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, LogOut, X } from "lucide-react";
import { useAdmin, loginAdmin, logoutAdmin } from "@/lib/admin";

export function AdminControl({ collapsed }: { collapsed: boolean }) {
  const isAdmin = useAdmin();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw.trim()) return;
    setLoading(true);
    setError(false);
    const ok = await loginAdmin(pw.trim());
    setLoading(false);
    if (ok) {
      setOpen(false);
      setPw("");
      router.refresh();
    } else {
      setError(true);
    }
  }

  // ----- Modo administrador activo -----
  if (isAdmin) {
    if (collapsed) {
      return (
        <button
          onClick={() => {
            logoutAdmin();
            router.refresh();
          }}
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
          onClick={() => {
            logoutAdmin();
            router.refresh();
          }}
          title="Salir del modo administrador"
          className="text-muted hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ----- Estudiante (sin sesión admin) -----
  if (collapsed) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-muted/70 hover:text-white"
      >
        <Lock className="h-3.5 w-3.5" /> Acceso Angel
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-card-soft p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-white">Acceso administrador</span>
        <button type="button" onClick={() => setOpen(false)} className="text-muted hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <input
        type="password"
        autoFocus
        value={pw}
        onChange={(e) => setPw(e.target.value)}
        placeholder="Clave"
        className={`h-9 w-full rounded-lg border bg-bg px-2.5 text-sm text-white outline-none ${
          error ? "border-neg" : "border-line focus:border-brand/50"
        }`}
      />
      {error && <p className="mt-1 text-[11px] text-neg">Clave incorrecta.</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 w-full rounded-lg bg-brand py-1.5 text-xs font-medium text-black hover:bg-brand-hover disabled:opacity-60"
      >
        {loading ? "Verificando..." : "Entrar"}
      </button>
    </form>
  );
}
