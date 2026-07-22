"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Ban, Check, Eye, EyeOff, Loader2, MessageCircle, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { IntroMotion } from "@/components/IntroMotion";
import { SITE, waLink } from "@/lib/site";
import { useAdmin, loginAdmin } from "@/lib/admin";
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
  const [introDone, setIntroDone] = useState(false);
  // Marca que en esta sesión se mostró la puerta (login/términos). Solo así
  // reproducimos la intro tras autenticarse — no en recargas ya con sesión.
  const cameFromGate = useRef(false);

  const authorized = isAdmin || Boolean(student && student.termsAccepted);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    // Al mostrarse la puerta (sin sesión) marcamos que la intro debe verse al
    // autenticarse, y la rearmamos por si fue un cierre de sesión previo.
    if (mounted && !authorized) {
      cameFromGate.current = true;
      setIntroDone(false);
    }
  }, [mounted, authorized]);

  // Evita parpadeos de contenido protegido durante la hidratación.
  if (!mounted) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    if (student && !student.termsAccepted) return <TermsScreen />;
    return <LoginScreen />;
  }

  // Autenticado. Si acaba de iniciar sesión (venía de la puerta) y aún no se
  // reprodujo la animación, muéstrala pegada antes de revelar la plataforma.
  if (cameFromGate.current && !introDone) {
    return <IntroMotion onDone={() => setIntroDone(true)} />;
  }

  return <>{children}</>;
}

/* -------------------------------------------------------------------------- */
/*  Cascarón de autenticación: pantalla completa por encima del layout.       */
/*  Escritorio: video de mercado a la izquierda + panel de formulario fijo.   */
/*  Móvil: solo el panel, con un brillo suave de marca.                       */
/* -------------------------------------------------------------------------- */

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex bg-bg">
      <MediaPanel />

      <div className="relative w-full overflow-y-auto bg-bg-soft lg:w-[480px] lg:border-l lg:border-line xl:w-[560px]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-72 lg:hidden"
          style={{
            background:
              "radial-gradient(560px 300px at 50% -20%, rgba(247,147,26,0.09), transparent 65%)",
          }}
        />
        <div className="relative flex min-h-full items-center">
          <div className="mx-auto w-full max-w-md px-6 py-12 sm:px-10">
            <div className="mb-10 lg:hidden">
              <Logo />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Panel visual: el mismo loop de velas del sitio, con velos para legibilidad.
 * Con prefers-reduced-motion se muestra la imagen estática.
 */
function MediaPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || reduce) return;
    const tryPlay = () => {
      v.muted = true;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    return () => v.removeEventListener("canplay", tryPlay);
  }, [reduce]);

  return (
    <div className="relative hidden flex-1 lg:block">
      {reduce ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/motionlogin-poster.jpg)" }}
        />
      ) : (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/motionlogin-poster.jpg"
        >
          <source src="/motionlogin.webm" type="video/webm" />
          <source src="/motionlogin.mp4" type="video/mp4" />
        </video>
      )}

      {/* Velos: legibilidad del texto sin apagar el video. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(10,11,13,0.55) 0%, rgba(10,11,13,0.15) 50%, rgba(10,11,13,0.45) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,11,13,0.45) 0%, transparent 35%, rgba(10,11,13,0.88) 100%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-between p-12">
        <Logo />
        <div className="max-w-lg animate-fade-up" style={{ animationDelay: "120ms" }}>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
            Opera los mercados con método.
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">
            Clases en vivo, módulos a tu ritmo y acompañamiento directo de Angel.
          </p>
          <div className="mt-8 border-t border-white/10 pt-5 text-sm text-white/50">
            Academia {SITE.name} · CEO Angel Hurtado
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function LoginScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [showCode, setShowCode] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = code.trim();
    if (!value || loading) return;
    setLoading(true);
    setError("");
    setBlocked(false);
    // La misma casilla sirve para Angel (admin) y para los alumnos:
    // primero probamos la clave de admin; si no coincide, validamos como alumno.
    const asAdmin = await loginAdmin(value);
    if (asAdmin) return; // AccessGate ya renderiza la app; el componente se desmonta.
    const res = await loginStudent(value);
    setLoading(false);
    if (res.ok) return;
    if (res.blocked) {
      setBlocked(true);
    } else {
      setError(res.error ?? "Código no válido.");
    }
  }

  return (
    <AuthShell>
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Acceso de alumnos
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Ingresa el código que te entregó Angel para entrar a tus clases.
        </p>

        <form onSubmit={submit} className="mt-8" noValidate>
          <label htmlFor="access-code" className="label">
            Código de acceso
          </label>
          <div className="relative">
            <input
              id="access-code"
              type={showCode ? "text" : "password"}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={32}
              disabled={loading}
              aria-invalid={Boolean(error)}
              className={`w-full rounded-xl border bg-card-soft px-4 py-3.5 pr-12 font-mono text-base font-medium tracking-[0.24em] text-white outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/15 disabled:opacity-60 ${
                error ? "border-neg/70" : "border-line"
              }`}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError("");
                if (blocked) setBlocked(false);
              }}
            />
            <button
              type="button"
              onClick={() => setShowCode((v) => !v)}
              tabIndex={-1}
              aria-label={showCode ? "Ocultar código" : "Mostrar código"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted transition hover:text-white"
            >
              {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-2 text-xs text-neg">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-4 w-full py-3.5 transition-transform active:scale-[0.99] disabled:pointer-events-none disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Verificando código...
              </>
            ) : (
              "Entrar a la plataforma"
            )}
          </button>
        </form>

        {blocked && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-neg/40 bg-neg/10 p-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-neg/15 text-neg">
                <Ban className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">Tu cuenta está bloqueada</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">
                  Angel suspendió el acceso a esta cuenta. Escríbele para reactivarlo.
                </p>
              </div>
            </div>
            <a
              href={waLink(
                `Hola Angel, mi cuenta en ${SITE.name} aparece bloqueada. ¿Puedes ayudarme a reactivar mi acceso?`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-3 w-full py-3"
            >
              <MessageCircle className="h-4 w-4" /> Contactar a Angel
            </a>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-line bg-card-soft/60 px-4 py-3.5">
          <div className="min-w-0 text-sm">
            <p className="font-medium text-white/90">¿Aún no tienes código?</p>
            <p className="mt-0.5 text-xs text-muted">
              El acceso lo entrega Angel personalmente.
            </p>
          </div>
          <a
            href={waLink(
              `Hola Angel, quiero acceso a la plataforma de ${SITE.name}.`
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost shrink-0 !px-3.5 !py-2 text-xs"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>

        <p className="mt-10 text-xs leading-relaxed text-muted">
          El trading conlleva riesgo de pérdida de capital.{" "}
          <Link
            href="/terminos"
            className="text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            Términos y condiciones
          </Link>
        </p>
      </div>
    </AuthShell>
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
    <AuthShell>
      <div className="animate-fade-up">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          Términos y condiciones
        </h1>
        <p className="mt-2 text-sm text-muted">
          Léelos y acéptalos para entrar a la plataforma.
        </p>

        <div className="mt-6 max-h-[38vh] overflow-y-auto whitespace-pre-line rounded-xl border border-line bg-card-soft/50 p-4 text-sm leading-relaxed text-muted">
          {terms}
        </div>

        <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-white/90">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-brand"
          />
          He leído y acepto los términos y condiciones, y entiendo que el trading
          conlleva riesgo de pérdida de capital.
        </label>

        {error && (
          <p role="alert" className="mt-2 text-xs text-neg">
            {error}
          </p>
        )}

        <button
          onClick={accept}
          disabled={!checked || loading}
          className="btn-primary mt-6 w-full py-3.5 transition-transform active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" /> Aceptar y continuar
            </>
          )}
        </button>
      </div>
    </AuthShell>
  );
}
