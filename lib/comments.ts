import { hasSupabase, getSupabase } from "./supabase";

/* -------------------------------------------------------------------------- */
/*  Comentarios de alumnos. Angel modera cuáles se muestran (approved).        */
/*  Requiere Supabase; sin él devuelve lista vacía.                           */
/* -------------------------------------------------------------------------- */

export interface Comment {
  id: number;
  authorName: string;
  body: string;
  approved: boolean;
  createdAt: string;
}

interface Row {
  id: number;
  author_name: string;
  body: string;
  approved: boolean;
  created_at: string;
}

function rowToComment(r: Row): Comment {
  return {
    id: r.id,
    authorName: r.author_name,
    body: r.body,
    approved: r.approved,
    createdAt: r.created_at,
  };
}

/** `all=true` (admin) devuelve todos; por defecto solo los aprobados. */
export async function listComments(all = false): Promise<Comment[]> {
  if (!hasSupabase()) return [];
  try {
    let query = getSupabase()
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });
    if (!all) query = query.eq("approved", true);
    const { data, error } = await query;
    if (error || !data) return [];
    return (data as Row[]).map(rowToComment);
  } catch {
    return [];
  }
}

export async function addComment(input: {
  studentId: number | null;
  authorName: string;
  body: string;
}): Promise<void> {
  const { error } = await getSupabase().from("comments").insert({
    student_id: input.studentId,
    author_name: input.authorName,
    body: input.body,
  });
  if (error) throw new Error(error.message);
}

export async function setCommentApproved(id: number, approved: boolean): Promise<void> {
  const { error } = await getSupabase().from("comments").update({ approved }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteComment(id: number): Promise<void> {
  const { error } = await getSupabase().from("comments").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
