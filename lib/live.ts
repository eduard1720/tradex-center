import { hasSupabase, getSupabase } from "./supabase";

/* -------------------------------------------------------------------------- */
/*  Clases en vivo programadas por Angel (modo admin).                        */
/*  Requiere la tabla `live_sessions` en Supabase.                            */
/* -------------------------------------------------------------------------- */

export interface LiveSession {
  id: number;
  title: string;
  startsAt: string; // ISO
  link: string;
}

interface Row {
  id: number;
  title: string;
  starts_at: string;
  link: string | null;
}

export async function getLiveSessions(): Promise<LiveSession[]> {
  if (!hasSupabase()) return [];
  try {
    const { data, error } = await getSupabase()
      .from("live_sessions")
      .select("*")
      .order("starts_at", { ascending: true });
    if (error || !data) return [];
    return (data as Row[]).map((r) => ({
      id: r.id,
      title: r.title,
      startsAt: r.starts_at,
      link: r.link ?? "",
    }));
  } catch {
    return [];
  }
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
