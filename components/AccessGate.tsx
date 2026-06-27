"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, Lock, ShieldCheck, Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SITE } from "@/lib/site";
import { useAdmin } from "@/lib/admin";
import { useStudent, loginStudent, acceptTerms } from "@/lib/student";
import { DEFAULT_TERMS } from "@/lib/terms";

/**
 * Puerta de acceso a la plataforma (solo alumnos de Angel):
 *  1. Admin (Angel) → acceso total.
 *  2. Sin sesión → pantalla de login con código de acceso.
 *  3. Con sesión pero sin aceptar términos → pantalla de aceptación.
 *  4. Todo en orden → renderiza la app.
 */
export function AccessGate({ children }: { children: React.ReactNode }) {
  const isAdmin = useAdmin();
  const student = useStudent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Evita parpadeos de contenido protegido durante la hidratación.
  if (!mounted) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (isAdmin) return <>{children}</>;
  if (!student) return <LoginScreen />;
  if (!student.termsAccepted) return <TermsScreen />;
  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */

function LoginScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    const res = await loginStudent(code.trim());
    setLoading(false);
    if (!res.ok) setError(res.error ?? "Código no válido.");
  }

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="card w-full max-w-md p-7 text-center">
        <div className="mx-auto mb-2 flex justify-center">
          <Logo />
        </div>
        <span className="mx-auto mt-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
          <KeyRound className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-xl font-semibold text-white">Acceso de alumnos</h1>
        <p className="mt-1 text-sm text-muted">
          Ingresa el código de acceso que te dio Angel para entrar a la plataforma.
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <input
            autoFocus
            className={`input text-center text-lg tracking-[0.3em] uppercase ${error ? "border-neg" : ""}`}
            placeholder="TU CÓDIGO"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          {error && <p className="text-xs text-neg">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Verificando...</>
            ) : (
              <><Lock className="h-4 w-4" /> Entrar</>
            )}
          </button>
        </form>

        <p className="mt-4 text-[11px] text-muted">
          ¿No tienes acceso?{" "}
          <a
            href={`https://wa.me/${SITE.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand hover:underline"
          >
            Escríbele a Angel por WhatsApp
          </a>
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function TermsScreen() {
  const [terms, setTerms] = useState(DEFAULT_TERMS);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings?key=terms_text")
      .then((r) => r.json())
      .then((d) => {
        if (d.value && d.value.trim()) setTerms(d.value);
      })
      .catch(() => {});
  }, []);

  async function accept() {
    setLoading(true);
    setError("");
    const ok = await acceptTerms();
    setLoading(false);
    if (!ok) setError("No se pudo registrar la aceptación. Inténtalo de nuevo.");
  }

  return (
    <div className="grid min-h-[70vh] place-items-center px-4">
      <div className="card w-full max-w-2xl p-7">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold text-white">Términos y condiciones</h1>
            <p className="text-xs text-muted">Acéptalos para usar la plataforma.</p>
          </div>
        </div>

        <div className="mt-5 max-h-[40vh] overflow-y-auto whitespace-pre-line rounded-xl border border-line bg-card-soft/50 p-4 text-sm leading-relaxed text-muted">
          {terms}
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-sm text-white/90">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand"
          />
          He leído y acepto los términos y condiciones, y entiendo que el trading conlleva
          riesgo de pérdida de capital.
        </label>

        {error && <p className="mt-2 text-xs text-neg">{error}</p>}

        <button
          onClick={accept}
          disabled={!checked || loading}
          className="btn-primary mt-5 w-full disabled:opacity-50"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Guardando...</>
          ) : (
            <><Check className="h-4 w-4" /> Aceptar y continuar</>
          )}
        </button>
        <p className="mt-2 text-center text-[11px] text-muted">
          También puedes leerlos en la página de{" "}
          <Link href="/terminos" className="text-brand hover:underline">
            Términos
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
