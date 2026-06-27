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
        <div className="card flex items-center gap-2 border-brand/30 p-4 text-sm text-muted">
          <ShieldCheck className="h-4 w-4 text-brand" />
          Modo Angel: aquí ves <strong className="text-white">todos</strong> los comentarios.
          Muestra u oculta cuáles aparecen para tus alumnos.
        </div>
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
