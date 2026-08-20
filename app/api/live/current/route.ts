import { NextResponse } from "next/server";
import { hasSupabase } from "@/lib/supabase";
import { getActiveStreamEmbed } from "@/lib/live";
import { getActiveStudentByCode } from "@/lib/students";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "angel-admin";

async function isAuthorized(req: Request): Promise<boolean> {
  if (req.headers.get("x-admin-password") === ADMIN_PASSWORD) return true;
  const code = req.headers.get("x-student-code");
  if (!code) return false;
  const student = await getActiveStudentByCode(code);
  return Boolean(student);
}

/** Devuelve el embed de la transmisión activa, solo a sesiones autenticadas. */
export async function GET(req: Request) {
  if (!hasSupabase()) {
    return NextResponse.json({ embedUrl: null });
  }
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 401 });
  }

  const stream = await getActiveStreamEmbed();
  if (!stream) {
    return NextResponse.json({ embedUrl: null });
  }
  return NextResponse.json({ embedUrl: stream.embedUrl, title: stream.title });
}
