import { hasSupabase, getSupabase } from "./supabase";

/* -------------------------------------------------------------------------- */
/*  Herramientas: archivos (PDF, diapositivas, libros…) que sube Angel.       */
/*  Los archivos viven en Supabase Storage (bucket "herramientas") y los      */
/*  metadatos en la tabla `resources`.                                        */
/* -------------------------------------------------------------------------- */

export const BUCKET = "herramientas";

export interface Resource {
  id: number;
  title: string;
  fileName: string;
  url: string;
  path: string;
  kind: string;
  createdAt: string;
}

interface Row {
  id: number;
  title: string;
  file_name: string;
  file_url: string;
  path: string;
  kind: string;
  created_at: string;
}

export function kindFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["ppt", "pptx", "key"].includes(ext)) return "slides";
  if (["doc", "docx", "txt", "rtf"].includes(ext)) return "doc";
  if (["epub", "mobi"].includes(ext)) return "book";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (["png", "jpg", "jpeg", "webp", "gif"].includes(ext)) return "image";
  if (["zip", "rar"].includes(ext)) return "zip";
  return "file";
}

export async function getResources(): Promise<Resource[]> {
  if (!hasSupabase()) return [];
  try {
    const { data, error } = await getSupabase()
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map((r) => ({
      id: r.id,
      title: r.title,
      fileName: r.file_name,
      url: r.file_url,
      path: r.path,
      kind: r.kind,
      createdAt: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function addResource(r: {
  title: string;
  fileName: string;
  url: string;
  path: string;
  kind: string;
}): Promise<void> {
  const { error } = await getSupabase().from("resources").insert({
    title: r.title,
    file_name: r.fileName,
    file_url: r.url,
    path: r.path,
    kind: r.kind,
  });
  if (error) throw new Error(error.message);
}

export async function deleteResource(id: number): Promise<void> {
  const sb = getSupabase();
  // Busca el path para borrar también el archivo del Storage.
  const { data } = await sb.from("resources").select("path").eq("id", id).maybeSingle();
  const path = (data as { path?: string } | null)?.path;
  if (path) await sb.storage.from(BUCKET).remove([path]);
  const { error } = await sb.from("resources").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
