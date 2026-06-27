"use client";

import { useCallback, useEffect, useState } from "react";
import {
  UserPlus,
  Loader2,
  Trash2,
  Copy,
  Check,
  Lock,
  MessageCircle,
  Power,
} from "lucide-react";
import { useAdmin, getAdminPw } from "@/lib/admin";
import { SITE } from "@/lib/site";
import type { Student } from "@/lib/students";

function waInvite(name: string, code: string) {
  const msg = `Hola ${name}, ya tienes acceso a ${SITE.name}. Entra con tu código personal: ${code}`;
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

export function StudentsAdmin() {
  const isAdmin = useAdmin();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    const res = await fetch("/api/students", {
      cache: "no-store",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    const data = await res.json().catch(() => ({ students: [] }));
    setStudents(data.students ?? []);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md">
        <div className="card space-y-2 p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
            <Lock className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold text-white">Solo para Angel</h2>
          <p className="text-sm text-muted">
            Inicia sesión como administrador desde el menú lateral para gestionar a tus alumnos.
          </p>
        </div>
      </div>
    );
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) return;
    setAdding(true);
    setError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": getAdminPw() ?? "" },
        body: JSON.stringify({ name: name.trim() }),
      });
      setAdding(false);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo crear el alumno.");
        return;
      }
      setName("");
      load();
    } catch {
      setAdding(false);
      setError("Error de red. Inténtalo de nuevo.");
    }
  }

  async function toggle(s: Student) {
    await fetch("/api/students", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": getAdminPw() ?? "" },
      body: JSON.stringify({ id: s.id, active: !s.active }),
    });
    load();
  }

  async function remove(s: Student) {
    if (!window.confirm(`¿Eliminar a ${s.name}? Perderá el acceso definitivamente.`)) return;
    await fetch(`/api/students?id=${s.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    load();
  }

  function copy(code: string) {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="card flex flex-wrap items-end gap-3 p-5">
        <div className="min-w-[220px] flex-1">
          <label className="label">Nombre del alumno</label>
          <input
            className="input"
            placeholder="Ej: Juan Pérez"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit" disabled={adding} className="btn-primary disabled:opacity-60">
          {adding ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</>
          ) : (
            <><UserPlus className="h-4 w-4" /> Dar de alta</>
          )}
        </button>
        {error && <p className="w-full text-xs text-neg">{error}</p>}
        <p className="w-full text-[11px] text-muted">
          Se genera un código único. Cópialo o envíaselo al alumno por WhatsApp; lo usará para
          entrar.
        </p>
      </form>

      {loading ? (
        <div className="card grid place-items-center py-12 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="card grid place-items-center py-12 text-center text-muted">
          Aún no has dado de alta a ningún alumno.
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <ul className="divide-y divide-line">
            {students.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{s.name}</p>
                  <button
                    onClick={() => copy(s.code)}
                    className="mt-0.5 inline-flex items-center gap-1.5 rounded-md bg-card-soft px-2 py-0.5 font-mono text-xs tracking-widest text-brand hover:text-white"
                    title="Copiar código"
                  >
                    {s.code}
                    {copied === s.code ? (
                      <Check className="h-3 w-3 text-pos" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    s.active ? "bg-pos/10 text-pos" : "bg-neg/10 text-neg"
                  }`}
                >
                  {s.active ? "Activo" : "Desactivado"}
                </span>

                <div className="flex items-center gap-1">
                  <a
                    href={waInvite(s.name, s.code)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Enviar código por WhatsApp"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => toggle(s)}
                    title={s.active ? "Desactivar" : "Activar"}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-white"
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(s)}
                    title="Eliminar"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:border-neg/40 hover:text-neg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
