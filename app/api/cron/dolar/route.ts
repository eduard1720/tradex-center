import { NextResponse } from "next/server";
import { getParallelUSD, recordSnapshot } from "@/lib/dolar";

export const dynamic = "force-dynamic";

/** Lo ejecuta el cron de Vercel (1 vez al día) para registrar el paralelo. */
export async function GET() {
  const rate = await getParallelUSD();
  await recordSnapshot(rate);
  return NextResponse.json({ ok: true, rate });
}
