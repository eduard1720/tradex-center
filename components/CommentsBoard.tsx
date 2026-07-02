"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  MessageSquareQuote,
  Loader2,
  Send,
  Eye,
  EyeOff,
  Trash2,
  ShieldCheck,
  X,
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

  // Comentario abierto en el modal central (o null).
  const [openComment, setOpenComment] = useState<Comment | null>(null);

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

  // Cerrar el modal con la tecla Escape.
  useEffect(() => {
    if (!openComment) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenComment(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openComment]);

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

  async function moderate(c: Comment, approved: boolean) {
    await fetch("/api/comentarios", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": getAdminPw() ?? "" },
      body: JSON.stringify({ id: c.id, approved }),
    });
    setOpenComment((o) => (o && o.id === c.id ? { ...o, approved } : o));
    load();
  }

  async function remove(c: Comment) {
    if (!window.confirm("¿Eliminar este comentario?")) return;
    await fetch(`/api/comentarios?id=${c.id}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    setOpenComment((o) => (o && o.id === c.id ? null : o));
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
        <div className="flex items-center gap-2 rounded-xl border border-line bg-card-soft/50 px-4 py-3 text-xs text-muted">
          <ShieldCheck className="h-4 w-4 shrink-0 text-brand" />
          Aquí ves <strong className="font-medium text-white/90">todos</strong> los
          comentarios de tus alumnos. Toca uno para leerlo completo y decidir si se
          muestra u oculta.
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
            <button
              key={c.id}
              onClick={() => setOpenComment(c)}
              className={`card relative flex flex-col p-5 text-left transition-colors hover:border-white/15 ${
                isAdmin && !c.approved ? "border-dashed opacity-80" : ""
              }`}
            >
              <p className="line-clamp-4 break-words text-sm leading-relaxed text-white/90">
                “{c.body}”
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-line pt-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-xs font-semibold text-white/80">
                  {initials(c.authorName)}
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-sm font-medium text-white">{c.authorName}</p>
                  <p className="text-xs text-muted">{formatDate(c.createdAt)}</p>
                </div>
                {isAdmin && (
                  <span
                    className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      c.approved ? "bg-pos/10 text-pos" : "bg-card-soft text-muted"
                    }`}
                  >
                    {c.approved ? "Visible" : "Oculto"}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal central con el comentario completo (portal al body para centrarlo
          en toda la pantalla, escapando de cualquier ancestro con transform). */}
      {openComment && typeof document !== "undefined" &&
        createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpenComment(null)}
          />
          <div className="relative z-10 flex max-h-[80vh] w-full max-w-lg flex-col rounded-2xl border border-line bg-bg-soft shadow-xl">
            <div className="flex items-start gap-3 border-b border-line p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.06] text-sm font-semibold text-white/80">
                {initials(openComment.authorName)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{openComment.authorName}</p>
                <p className="text-xs text-muted">{formatDate(openComment.createdAt)}</p>
              </div>
              <button
                onClick={() => setOpenComment(null)}
                aria-label="Cerrar"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90">
                {openComment.body}
              </p>
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2 border-t border-line p-4">
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    openComment.approved ? "bg-pos/10 text-pos" : "bg-card-soft text-muted"
                  }`}
                >
                  {openComment.approved ? "Visible" : "Oculto"}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => moderate(openComment, !openComment.approved)}
                    className="btn-ghost !px-3 !py-2 text-xs"
                  >
                    {openComment.approved ? (
                      <><EyeOff className="h-4 w-4" /> Ocultar</>
                    ) : (
                      <><Eye className="h-4 w-4" /> Mostrar</>
                    )}
                  </button>
                  <button
                    onClick={() => remove(openComment)}
                    className="btn-ghost !px-3 !py-2 text-xs text-neg hover:border-neg/40 hover:text-neg"
                  >
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
