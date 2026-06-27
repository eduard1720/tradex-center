import { hasSupabase, getSupabase } from "./supabase";

/* -------------------------------------------------------------------------- */
/*  Journal de trading por alumno. Requiere Supabase.                         */
/* -------------------------------------------------------------------------- */

export type Direction = "long" | "short";
export type Outcome = "win" | "loss" | "be";

export interface JournalEntry {
  id: number;
  date: string;
  asset: string;
  direction: Direction;
  outcome: Outcome;
  riskReward: string;
  notes: string;
}

interface Row {
  id: number;
  entry_date: string;
  asset: string;
  direction: string;
  outcome: string;
  risk_reward: string;
  notes: string;
}

function rowToEntry(r: Row): JournalEntry {
  return {
    id: r.id,
    date: r.entry_date,
    asset: r.asset,
    direction: (r.direction as Direction) ?? "long",
    outcome: (r.outcome as Outcome) ?? "be",
    riskReward: r.risk_reward ?? "",
    notes: r.notes ?? "",
  };
}

export async function listEntries(studentId: number): Promise<JournalEntry[]> {
  if (!hasSupabase()) return [];
  try {
    const { data, error } = await getSupabase()
      .from("journal_entries")
      .select("*")
      .eq("student_id", studentId)
      .order("entry_date", { ascending: false });
    if (error || !data) return [];
    return (data as Row[]).map(rowToEntry);
  } catch {
    return [];
  }
}

export async function addEntry(
  studentId: number,
  input: {
    date: string;
    asset: string;
    direction: Direction;
    outcome: Outcome;
    riskReward: string;
    notes: string;
  }
): Promise<void> {
  const { error } = await getSupabase().from("journal_entries").insert({
    student_id: studentId,
    entry_date: input.date,
    asset: input.asset,
    direction: input.direction,
    outcome: input.outcome,
    risk_reward: input.riskReward,
    notes: input.notes,
  });
  if (error) throw new Error(error.message);
}

export async function deleteEntry(id: number, studentId: number): Promise<void> {
  const { error } = await getSupabase()
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("student_id", studentId);
  if (error) throw new Error(error.message);
}
