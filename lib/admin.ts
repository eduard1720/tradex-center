"use client";

import { useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Sesión de administrador (Angel) — guardada en el navegador.               */
/*  La clave se valida contra el servidor (/api/admin) antes de guardarse.    */
/* -------------------------------------------------------------------------- */

const KEY = "tradex_admin_pw";
const EVENT = "tradex-admin";

export function getAdminPw(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

function emit() {
  window.dispatchEvent(new Event(EVENT));
}

export async function loginAdmin(pw: string): Promise<boolean> {
  try {
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "x-admin-password": pw },
    });
    if (!res.ok) return false;
    localStorage.setItem(KEY, pw);
    emit();
    return true;
  } catch {
    return false;
  }
}

export function logoutAdmin(): void {
  localStorage.removeItem(KEY);
  emit();
}

export function onAdminChange(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Hook: ¿hay sesión de administrador activa? */
export function useAdmin(): boolean {
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const sync = () => setIsAdmin(Boolean(getAdminPw()));
    sync();
    return onAdminChange(sync);
  }, []);
  return isAdmin;
}
