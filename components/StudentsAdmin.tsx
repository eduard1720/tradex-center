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
  ArrowLeft,
  ChevronRight,
  Ban,
  ShieldCheck,
  Calendar,
  KeyRound,
} from "lucide-react";
import { useAdmin, getAdminPw } from "@/lib/admin";
import { SITE } from "@/lib/site";
import type { Student } from "@/lib/students";

function waInvite(name: string, code: string) {
  const msg = `Hola ${name}, ya tienes acceso a ${SITE.name}. Entra con tu código personal: ${code}`;
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function StudentsAdmin() {
  const isAdmin = useAdmin();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
    setSelectedId(null);
    load();
  }

  function copyCode(code: string) {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const selected = students.find((s) => s.id === selectedId) ?? null;

  /* ---------------------------- Perfil del alumno --------------------------- */
  if (selected) {
    return (
      <div className="animate-fade-up space-y-5">
        <button
          onClick={() => setSelectedId(null)}
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a la lista
        </button>

        <div className="card p-6">
          {/* Encabezado */}
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-lg font-semibold text-white/80">
              {initials(selected.name)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-white">{selected.name}</h2>
              <span
                className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  selected.active ? "bg-pos/10 text-pos" : "bg-neg/10 text-neg"
                }`}
              >
                {selected.active ? (
                  <><ShieldCheck className="h-3.5 w-3.5" /> Acceso activo</>
                ) : (
                  <><Ban className="h-3.5 w-3.5" /> Acceso bloqueado</>
                )}
              </span>
            </div>
          </div>

          {/* Información */}
          <dl className="mt-6 divide-y divide-line border-t border-line">
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="inline-flex items-center gap-2 text-sm text-muted">
                <KeyRound className="h-4 w-4" /> Código de acceso
              </dt>
              <dd>
                <button
                  onClick={() => copyCode(selected.code)}
                  title="Copiar código"
                  className="inline-flex items-center gap-1.5 rounded-md bg-card-soft px-2.5 py-1 font-mono text-sm tracking-widest text-brand transition-colors hover:text-white"
                >
                  {selected.code}
                  {copied ? <Check className="h-3.5 w-3.5 text-pos" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="inline-flex items-center gap-2 text-sm text-muted">
                <Calendar className="h-4 w-4" /> Fecha de alta
              </dt>
              <dd className="text-sm text-white/90">{formatDate(selected.createdAt)}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3.5">
              <dt className="inline-flex items-center gap-2 text-sm text-muted">
                <Check className="h-4 w-4" /> Términos y condiciones
              </dt>
              <dd className="text-right text-sm">
                {selected.termsAcceptedAt ? (
                  <span className="text-pos">Aceptados el {formatDate(selected.termsAcceptedAt)}</span>
                ) : (
                  <span className="text-muted">Pendientes</span>
                )}
              </dd>
            </div>
          </dl>

          {/* Acciones */}
          <div className="mt-6 flex flex-col gap-2 border-t border-line pt-5 sm:flex-row sm:flex-wrap">
            <a
              href={waInvite(selected.name, selected.code)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost justify-center"
            >
              <MessageCircle className="h-4 w-4" /> Enviar código por WhatsApp
            </a>
            <button
              onClick={() => toggle(selected)}
              className="btn-ghost justify-center"
            >
              {selected.active ? (
                <><Ban className="h-4 w-4" /> Bloquear acceso</>
              ) : (
                <><ShieldCheck className="h-4 w-4" /> Desbloquear acceso</>
              )}
            </button>
            <button
              onClick={() => remove(selected)}
              className="btn-ghost justify-center text-neg hover:border-neg/40 hover:text-neg sm:ml-auto"
            >
              <Trash2 className="h-4 w-4" /> Eliminar alumno
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------- Lista + alta ----------------------------- */
  return (
    <div className="space-y-6">
      <form onSubmit={add} className="card flex flex-wrap items-end gap-3 p-5">
        <div className="min-w-[220px] flex-1">
          <label className="label">Añadir alumno</label>
          <input
            className="input"
            placeholder="Nombre del alumno (ej: Juan Pérez)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button type="submit" disabled={adding} className="btn-primary disabled:opacity-60">
          {adding ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Creando...</>
          ) : (
            <><UserPlus className="h-4 w-4" /> Añadir alumno</>
          )}
        </button>
        {error && <p className="w-full text-xs text-neg">{error}</p>}
        <p className="w-full text-[11px] text-muted">
          Se genera un código único. Ábrele el perfil para enviárselo o gestionar su acceso.
        </p>
      </form>

      {loading ? (
        <div className="card grid place-items-center py-12 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : students.length === 0 ? (
        <div className="card grid place-items-center py-12 text-center text-muted">
          Aún no has añadido a ningún alumno.
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3 text-xs text-muted">
            <span>{students.length} {students.length === 1 ? "alumno" : "alumnos"}</span>
          </div>
          <ul className="divide-y divide-line border-t border-line">
            {students.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSelectedId(s.id)}
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/[0.03]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.06] text-xs font-semibold text-white/80">
                    {initials(s.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{s.name}</p>
                    <p className="mt-0.5 font-mono text-xs tracking-widest text-muted">{s.code}</p>
                  </div>
                  <span
                    className={`hidden rounded-full px-2 py-0.5 text-[11px] font-medium sm:inline ${
                      s.active ? "bg-pos/10 text-pos" : "bg-neg/10 text-neg"
                    }`}
                  >
                    {s.active ? "Activo" : "Bloqueado"}
                  </span>
                  {!s.active && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-neg sm:hidden" />
                  )}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
