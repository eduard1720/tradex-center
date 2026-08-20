import { hasSupabase, getSupabase } from "./supabase";
import { parseVideo } from "./video";

/* -------------------------------------------------------------------------- */
/*  Clases en vivo programadas por Angel (modo admin).                        */
/*  Requiere la tabla `live_sessions` en Supabase.                            */
/* -------------------------------------------------------------------------- */

export interface LiveSession {
  id: number;
  title: string;
  startsAt: string; // ISO
  link: string;
  /** Transmisión de YouTube activa ahora mismo (no revela stream_url). */
  isLive: boolean;
}

interface Row {
  id: number;
  title: string;
  starts_at: string;
  link: string | null;
  stream_url: string | null;
  is_live: boolean;
}

// Columnas seguras de exponer en el árbol server-rendered (nunca stream_url:
// Next.js serializa las props de Server Components dentro del payload RSC
// inicial, así que aunque AccessGate oculte la UI en el cliente, el HTML ya
// habría viajado con el dato si lo incluyéramos aquí).
const PUBLIC_COLUMNS = "id, title, starts_at, link, is_live";

export async function getLiveSessions(): Promise<LiveSession[]> {
  if (!hasSupabase()) return [];
  try {
    const { data, error } = await getSupabase()
      .from("live_sessions")
      .select(PUBLIC_COLUMNS)
      .order("starts_at", { ascending: true });
    if (error || !data) return [];
    return (data as Row[]).map((r) => ({
      id: r.id,
      title: r.title,
      startsAt: r.starts_at,
      link: r.link ?? "",
      isLive: r.is_live,
    }));
  } catch {
    return [];
  }
}

/**
 * Server-only: enlace embebible de la transmisión activa (si hay alguna).
 * Nunca pases el resultado como prop de un Server Component — solo se debe
 * devolver desde una API route tras validar la sesión del alumno/admin.
 */
export async function getActiveStreamEmbed(): Promise<{ embedUrl: string; title: string } | null> {
  if (!hasSupabase()) return null;
  try {
    const { data, error } = await getSupabase()
      .from("live_sessions")
      .select("title, stream_url")
      .eq("is_live", true)
      .not("stream_url", "eq", "")
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data || !data.stream_url) return null;
    const { embedUrl } = parseVideo(data.stream_url);
    return { embedUrl, title: data.title };
  } catch {
    return null;
  }
}

export async function setLiveStream(
  id: number,
  input: { streamUrl: string; isLive: boolean }
): Promise<void> {
  const { error } = await getSupabase()
    .from("live_sessions")
    .update({ stream_url: input.streamUrl, is_live: input.isLive })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addLiveSession(input: {
  title: string;
  startsAt: string;
  link: string;
}): Promise<void> {
  const { error } = await getSupabase().from("live_sessions").insert({
    title: input.title,
    starts_at: input.startsAt,
    link: input.link,
  });
  if (error) throw new Error(error.message);
}

export async function deleteLiveSession(id: number): Promise<void> {
  const { error } = await getSupabase().from("live_sessions").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
