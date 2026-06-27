import { hasSupabase, getSupabase } from "./supabase";

/* -------------------------------------------------------------------------- */
/*  Ajustes del sitio (clave/valor): video de bienvenida, texto de T&C…       */
/*  Sin Supabase devuelve "" (la app sigue funcionando como demo).            */
/* -------------------------------------------------------------------------- */

export async function getSetting(key: string): Promise<string> {
  if (!hasSupabase()) return "";
  try {
    const { data, error } = await getSupabase()
      .from("settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return "";
    return (data as { value: string }).value ?? "";
  } catch {
    return "";
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const { error } = await getSupabase()
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}
