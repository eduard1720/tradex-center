"use client";

import { useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Sesión de alumno — guardada en el navegador.                              */
/*  El código se valida contra el servidor (/api/student/login) antes de      */
/*  guardarse. Angel da de alta a cada alumno y puede revocarlo.              */
/* -------------------------------------------------------------------------- */

const KEY = "tradex_student";
const EVENT = "tradex-student";

export interface StudentSession {
  name: string;
  code: string;
  /** True cuando el alumno ya aceptó los términos y condiciones. */
  termsAccepted: boolean;
}

export function getStudent(): StudentSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StudentSession) : null;
  } catch {
    return null;
  }
}

export function getStudentCode(): string | null {
  return getStudent()?.code ?? null;
}

function emit() {
  window.dispatchEvent(new Event(EVENT));
}

function persist(session: StudentSession) {
  localStorage.setItem(KEY, JSON.stringify(session));
  emit();
}

/** Valida el código contra el servidor y, si es correcto, guarda la sesión. */
export async function loginStudent(
  code: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/student/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data.error ?? "Código no válido." };
    persist({ name: data.name, code, termsAccepted: Boolean(data.termsAccepted) });
    return { ok: true };
  } catch {
    return { ok: false, error: "Error de red. Inténtalo de nuevo." };
  }
}

/** Marca los términos como aceptados (servidor + sesión local). */
export async function acceptTerms(): Promise<boolean> {
  const session = getStudent();
  if (!session) return false;
  try {
    const res = await fetch("/api/student/terms", {
      method: "POST",
      headers: { "x-student-code": session.code },
    });
    if (!res.ok) return false;
    persist({ ...session, termsAccepted: true });
    return true;
  } catch {
    return false;
  }
}

export function logoutStudent(): void {
  localStorage.removeItem(KEY);
  emit();
}

export function onStudentChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Hook: sesión de alumno activa (o null). */
export function useStudent(): StudentSession | null {
  const [session, setSession] = useState<StudentSession | null>(null);
  useEffect(() => {
    const sync = () => setSession(getStudent());
    sync();
    return onStudentChange(sync);
  }, []);
  return session;
}
