"use client";

/* -------------------------------------------------------------------------- */
/*  Progreso del alumno (clases completadas) guardado en el navegador.        */
/*  Sin login: el progreso vive en localStorage de cada dispositivo.          */
/* -------------------------------------------------------------------------- */

const KEY = "tradex_completed_v1";
const EVENT = "tradex-progress";

export function getCompleted(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function save(set: Set<string>): void {
  localStorage.setItem(KEY, JSON.stringify([...set]));
  // Notifica a otras vistas abiertas (módulos, detalle) en la misma pestaña.
  window.dispatchEvent(new Event(EVENT));
}

export function isCompleted(id: string): boolean {
  return getCompleted().has(id);
}

export function setCompleted(id: string, value: boolean): void {
  const set = getCompleted();
  if (value) set.add(id);
  else set.delete(id);
  save(set);
}

export function toggleCompleted(id: string): boolean {
  const next = !isCompleted(id);
  setCompleted(id, next);
  return next;
}

/** Suscríbete a cambios de progreso (mismo tab + otras pestañas). */
export function onProgressChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
