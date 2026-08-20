import { getSupabase } from "./supabase";

/* -------------------------------------------------------------------------- */
/*  Chat en vivo: mensajes durante una clase en vivo.                         */
/*  Requiere la tabla `live_chat_messages` en Supabase.                       */
/*  Sin lectura pública (igual que stream_url): se sirve vía /api/live/chat   */
/*  tras validar la sesión del alumno o de Angel.                             */
/* -------------------------------------------------------------------------- */

export interface LiveChatMessage {
  id: number;
  authorName: string;
  isAdmin: boolean;
  body: string;
  createdAt: string;
}

interface Row {
  id: number;
  author_name: string;
  is_admin: boolean;
  body: string;
  created_at: string;
}

const MAX_BODY_LENGTH = 500;

function rowToMessage(r: Row): LiveChatMessage {
  return {
    id: r.id,
    authorName: r.author_name,
    isAdmin: r.is_admin,
    body: r.body,
    createdAt: r.created_at,
  };
}

/** Mensajes de una sesión, opcionalmente solo los posteriores a `afterId`. */
export async function listChatMessages(
  sessionId: number,
  afterId = 0
): Promise<LiveChatMessage[]> {
  let query = getSupabase()
    .from("live_chat_messages")
    .select("id, author_name, is_admin, body, created_at")
    .eq("session_id", sessionId)
    .order("id", { ascending: true })
    .limit(200);
  if (afterId > 0) query = query.gt("id", afterId);
  const { data, error } = await query;
  if (error || !data) return [];
  return (data as Row[]).map(rowToMessage);
}

export async function addChatMessage(input: {
  sessionId: number;
  studentId: number | null;
  authorName: string;
  isAdmin: boolean;
  body: string;
}): Promise<LiveChatMessage> {
  const body = input.body.trim().slice(0, MAX_BODY_LENGTH);
  if (!body) throw new Error("El mensaje no puede estar vacío.");

  const { data, error } = await getSupabase()
    .from("live_chat_messages")
    .insert({
      session_id: input.sessionId,
      student_id: input.studentId,
      author_name: input.authorName,
      is_admin: input.isAdmin,
      body,
    })
    .select("id, author_name, is_admin, body, created_at")
    .single();
  if (error || !data) throw new Error(error?.message ?? "No se pudo enviar el mensaje.");
  return rowToMessage(data as Row);
}
