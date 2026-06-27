import { hasSupabase, getSupabase } from "./supabase";

/* -------------------------------------------------------------------------- */
/*  Progreso del alumno (server). Una fila por clase completada.              */
/*  Requiere Supabase.                                                        */
/* -------------------------------------------------------------------------- */

export async function getCompletedClassIds(studentId: number): Promise<string[]> {
  if (!hasSupabase()) return [];
  try {
    const { data, error } = await getSupabase()
      .from("progress")
      .select("class_id")
      .eq("student_id", studentId);
    if (error || !data) return [];
    return (data as { class_id: string }[]).map((r) => r.class_id);
  } catch {
    return [];
  }
}

export async function markCompleted(studentId: number, classId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("progress")
    .upsert(
      { student_id: studentId, class_id: classId },
      { onConflict: "student_id,class_id", ignoreDuplicates: true }
    );
  if (error) throw new Error(error.message);
}

export async function unmarkCompleted(studentId: number, classId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("progress")
    .delete()
    .eq("student_id", studentId)
    .eq("class_id", classId);
  if (error) throw new Error(error.message);
}
