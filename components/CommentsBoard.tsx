"use client";

import { useCallback, useEffect, useState } from "react";
import {
  MessageSquareQuote,
  Loader2,
  Send,
  Eye,
  EyeOff,
  Trash2,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { useAdmin, getAdminPw } from "@/lib/admin";
import { useStudent, getStudentCode } from "@/lib/student";
import type { Comment } from "@/lib/comments";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { day: "numeric", month: "long", year: "numeric" });
}

export function CommentsBoard() {
  const isAdmin = useAdmin();
  const student = useStudent();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Formulario de Angel para agregar un testimonio (aprobado al instante).
  const [tName, setTName] = useState("");
  const [tBody, setTBody] = useState("");
  const [tSending, setTSending] = useState(false);
  const [tError, setTError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/comentarios", {
      cache: "no-store",
      headers: isAdmin ? { "x-admin-password": getAdminPw() ?? "" } : {},
    });
    const data = await res.json().catch(() => ({ comments: [] }));
    setComments(data.comments ?? []);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 3) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-student-code": getStudentCode() ?? "" },
        body: JSON.stringify({ body: body.trim() }),
      });
      setSending(false);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo enviar.");
        return;
      }
      setBody("");
      setNotice("¡Gracias! Tu comentario fue enviado y aparecerá cuando Angel lo apruebe.");
      load();
    } catch {
      setSending(false);
      setError("Error de red. Inténtalo de nuevo.");
    }
  }

  async function addTestimonial(e: React.FormEvent) {
    e.preventDefault();
    if (tName.trim().length < 2 || tBody.trim().length < 3) return;
    setTSending(true);
    setTError("");
    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": getAdminPw() ?? "" },
        body: JSON.stringify({ authorName: tName.trim(), body: tBody.trim() }),
      });
      setTSending(false);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setTError(d.error ?? "No se pudo guardar.");
        return;
      }
      setTName("");
      setTBody("");
      load();
    } catch {
      setTSending(false);
      setTError("Error de red. Inténtalo de nuevo.");
    }
  }

  async function moderate(id: number, approved: boolean) {
    await fetch("/api/comentarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": getAdminPw() ?? "" },
      body: JSON.stringify({ id, approved }),
    });
    load();
  }

  async function remove(id: number) {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    await fetch(`/api/comentarios?id=${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    load();
  }

  return (
    <div className="space-y-6">
      {/* Formulario del alumno */}
      {student && !isAdmin && (
        <form onSubmit={submit} className="card space-y-3 p-5">
          <label className="label">Deja tu comentario</label>
          <textarea
            className="input min-h-[90px] resize-y"
            placeholder="Cuéntale a Angel y a la comunidad cómo te ha ido con las clases..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          {error && <p className="text-xs text-neg">{error}</p>}
          {notice && <p className="text-xs text-pos">{notice}</p>}
          <button type="submit" disabled={sending} className="btn-primary disabled:opacity-60">
            {sending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="h-4 w-4" /> Enviar comentario</>
            )}
          </button>
          <p className="text-[11px] text-muted">
            Tu comentario se publicará una vez que Angel lo apruebe.
          </p>
        </form>
      )}

      {isAdmin && (
        <>
          <form onSubmit={addTestimonial} className="card space-y-3 p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span className="text-sm font-medium text-white">Agregar testimonio</span>
            </div>
            <p className="text-xs text-muted">
              Publica el testimonio de un alumno. Aparece al instante bajo el video de
              bienvenida y aquí, sin necesidad de aprobarlo.
            </p>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,220px)_1fr]">
              <input
                className="input"
                placeholder="Nombre del alumno"
                value={tName}
                maxLength={60}
                onChange={(e) => setTName(e.target.value)}
              />
              <textarea
                className="input min-h-[44px] resize-y sm:min-h-0"
                placeholder="Lo que dijo sobre las clases..."
                value={tBody}
                onChange={(e) => setTBody(e.target.value)}
              />
            </div>
            {tError && <p className="text-xs text-neg">{tError}</p>}
            <button
              type="submit"
              disabled={tSending || tName.trim().length < 2 || tBody.trim().length < 3}
              className="btn-primary disabled:opacity-50"
            >
              {tSending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</>
              ) : (
                <><Plus className="h-4 w-4" /> Publicar testimonio</>
              )}
            </button>
          </form>

          <div className="flex items-center gap-2 rounded-xl border border-line bg-card-soft/50 px-4 py-3 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0 text-brand" />
            Aquí ves <strong className="font-medium text-white/90">todos</strong> los
            comentarios (los tuyos y los de alumnos). Muestra u oculta cuáles aparecen.
          </div>
        </>
      )}

      {/* Lista */}
      {loading ? (
        <div className="card grid place-items-center py-12 text-muted">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="card grid place-items-center py-12 text-center text-muted">
          <MessageSquareQuote className="mb-2 h-7 w-7 text-brand/40" />
          Aún no hay comentarios. {student && !isAdmin && "¡Sé el primero en dejar el tuyo!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`card relative p-5 ${isAdmin && !c.approved ? "border-dashed opacity-80" : ""}`}
            >
              <p className="text-sm leading-relaxed text-white/90">“{c.body}”</p>
              <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/20 text-xs font-bold text-brand">
                  {initials(c.authorName)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-white">{c.authorName}</p>
                  <p className="text-xs text-muted">{formatDate(c.createdAt)}</p>
                </div>
              </div>

              {isAdmin && (
                <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                  {!c.approved ? (
                    <span className="rounded-full bg-card-soft px-2 py-0.5 text-[11px] text-muted">
                      Oculto
                    </span>
                  ) : (
                    <span className="rounded-full bg-pos/10 px-2 py-0.5 text-[11px] text-pos">
                      Visible
                    </span>
                  )}
                  <div className="ml-auto flex items-center gap-1">
                    <button
                      onClick={() => moderate(c.id, !c.approved)}
                      title={c.approved ? "Ocultar" : "Mostrar"}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-white"
                    >
                      {c.approved ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      title="Eliminar"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:border-neg/40 hover:text-neg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
