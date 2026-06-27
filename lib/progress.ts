"use client";

/* -------------------------------------------------------------------------- */
/*  Progreso del alumno (clases completadas) — respaldado en Supabase.        */
/*  Se cachea en memoria y se sincroniza con /api/progress usando el código   */
/*  del alumno. El avance es por alumno y se comparte entre dispositivos.     */
/* -------------------------------------------------------------------------- */

import { getStudentCode, onStudentChange } from "./student";

const EVENT = "tradex-progress";

let cache: Set<string> | null = null;
let loading = false;

function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

async function fetchCompleted(): Promise<Set<string>> {
  const code = getStudentCode();
  if (!code) return new Set();
  try {
    const res = await fetch("/api/progress", {
      headers: { "x-student-code": code },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({ completed: [] }));
    return new Set<string>(data.completed ?? []);
  } catch {
    return new Set();
  }
}

/** Carga (o recarga) el progreso desde la base de datos. */
export async function loadProgress(): Promise<Set<string>> {
  loading = true;
  cache = await fetchCompleted();
  loading = false;
  emit();
  return cache;
}

/** Lectura síncrona de la caché. Dispara una carga si aún no se ha hecho. */
export function getCompleted(): Set<string> {
  if (cache === null && !loading) {
    loading = true;
    fetchCompleted().then((s) => {
      cache = s;
      loading = false;
      emit();
    });
  }
  return cache ?? new Set();
}

export function isCompleted(id: string): boolean {
  return getCompleted().has(id);
}

/** Marca/desmarca una clase (optimista + persistencia en la base de datos). */
export function setCompleted(id: string, value: boolean): void {
  const code = getStudentCode();
  if (!code) return;

  const next = new Set(cache ?? getCompleted());
  if (value) next.add(id);
  else next.delete(id);
  cache = next;
  emit();

  const req = value
    ? fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-student-code": code },
        body: JSON.stringify({ classId: id }),
      })
    : fetch(`/api/progress?classId=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-student-code": code },
      });
  // Si falla la persistencia, recargamos para no quedar desincronizados.
  req.then((r) => {
    if (!r.ok) loadProgress();
  }).catch(() => loadProgress());
}

export function toggleCompleted(id: string): boolean {
  const next = !isCompleted(id);
  setCompleted(id, next);
  return next;
}

/** Suscríbete a cambios de progreso (marca/desmarca, login/logout). */
export function onProgressChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}

// Al cambiar de alumno (login/logout), invalida la caché y recarga.
if (typeof window !== "undefined") {
  onStudentChange(() => {
    cache = null;
    loading = false;
    emit();
  });
}
