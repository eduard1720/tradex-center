"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { getStudentCode } from "@/lib/student";
import { getAdminPw } from "@/lib/admin";

interface ChatMessage {
  id: number;
  authorName: string;
  isAdmin: boolean;
  body: string;
  createdAt: string;
}

const POLL_MS = 3000;

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const pw = getAdminPw();
  const code = getStudentCode();
  if (pw) headers["x-admin-password"] = pw;
  else if (code) headers["x-student-code"] = code;
  return headers;
}

/** Chat en vivo de la clase actual. Poll cada pocos segundos (sin Supabase Realtime:
 *  el proyecto no expone una anon key al navegador, todo pasa por API routes). */
export function LiveChat({ sessionId }: { sessionId: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const lastIdRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(
          `/api/live/chat?sessionId=${sessionId}&afterId=${lastIdRef.current}`,
          { headers: authHeaders() }
        );
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const fresh: ChatMessage[] = data.messages ?? [];
        if (fresh.length > 0) {
          lastIdRef.current = fresh[fresh.length - 1].id;
          setMessages((prev) => [...prev, ...fresh]);
        }
      } catch {
        // Silencioso: se reintenta en el siguiente poll.
      }
    }

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [sessionId]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/live/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ sessionId, body }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "No se pudo enviar el mensaje.");
        return;
      }
      setText("");
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="card flex h-[420px] flex-col overflow-hidden p-0">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <MessageCircle className="h-4 w-4 text-brand" />
        <span className="text-sm font-medium text-white">Chat en vivo</span>
      </div>

      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-muted">Aún no hay mensajes. ¡Sé el primero!</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <span className={m.isAdmin ? "font-semibold text-brand" : "font-semibold text-white"}>
              {m.authorName}
              {m.isAdmin && " 👑"}
            </span>
            <span className="text-muted"> · </span>
            <span className="text-muted">{m.body}</span>
          </div>
        ))}
      </div>

      <form onSubmit={send} className="border-t border-line p-3">
        <div className="flex items-center gap-2">
          <input
            className="input !py-2 text-sm"
            placeholder="Escribe un mensaje..."
            value={text}
            maxLength={500}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="btn-primary !px-3 !py-2 disabled:opacity-60"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
        {error && <p className="mt-1.5 text-[11px] text-neg">{error}</p>}
      </form>
    </div>
  );
}
