import { getSupabase } from "./supabase";

/* -------------------------------------------------------------------------- */
/*  Alumnos (server). Cada alumno tiene un código de acceso único.            */
/*  Requiere Supabase (igual que live_sessions).                              */
/* -------------------------------------------------------------------------- */

export interface Student {
  id: number;
  name: string;
  code: string;
  active: boolean;
  termsAcceptedAt: string | null;
  createdAt: string;
}

interface Row {
  id: number;
  name: string;
  code: string;
  active: boolean;
  terms_accepted_at: string | null;
  created_at: string;
}

function rowToStudent(r: Row): Student {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    active: r.active,
    termsAcceptedAt: r.terms_accepted_at,
    createdAt: r.created_at,
  };
}

/** Genera un código corto y legible (sin caracteres ambiguos). */
function genCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/** Valida un código de alumno activo. Devuelve el alumno o null. */
export async function getActiveStudentByCode(code: string): Promise<Student | null> {
  const clean = code.trim().toUpperCase();
  if (!clean) return null;
  const { data, error } = await getSupabase()
    .from("students")
    .select("*")
    .eq("code", clean)
    .eq("active", true)
    .maybeSingle();
  if (error || !data) return null;
  return rowToStudent(data as Row);
}

export async function listStudents(): Promise<Student[]> {
  const { data, error } = await getSupabase()
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as Row[]).map(rowToStudent);
}

export async function addStudent(name: string): Promise<Student> {
  // Reintenta si el código generado ya existe (colisión muy improbable).
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = genCode();
    const { data, error } = await getSupabase()
      .from("students")
      .insert({ name, code })
      .select("*")
      .single();
    if (!error && data) return rowToStudent(data as Row);
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      throw new Error(error.message);
    }
  }
  throw new Error("No se pudo generar un código único. Inténtalo de nuevo.");
}

export async function setStudentActive(id: number, active: boolean): Promise<void> {
  const { error } = await getSupabase().from("students").update({ active }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteStudent(id: number): Promise<void> {
  const { error } = await getSupabase().from("students").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function acceptStudentTerms(code: string): Promise<void> {
  const { error } = await getSupabase()
    .from("students")
    .update({ terms_accepted_at: new Date().toISOString() })
    .eq("code", code.trim().toUpperCase());
  if (error) throw new Error(error.message);
}
