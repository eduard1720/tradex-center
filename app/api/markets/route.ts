import { NextResponse } from "next/server";
import { getIndices } from "@/lib/markets";

export const dynamic = "force-dynamic";

/** Índices y materias primas (Stooq), proxy para evitar CORS en el navegador. */
export async function GET() {
  return NextResponse.json({ indices: await getIndices() });
}
