import { NotebookPen } from "lucide-react";
import { JournalBoard } from "@/components/JournalBoard";

export const metadata = { title: "Journal de trading — TradeX Center" };

export default function JournalPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="inline-flex items-center gap-1.5 text-sm text-brand">
          <NotebookPen className="h-4 w-4" /> Tu bitácora
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Journal de trading
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Registra cada operación: el journaling es clave para mejorar tu disciplina y detectar
          tus patrones. Solo tú ves tu bitácora.
        </p>
      </div>

      <JournalBoard />
    </div>
  );
}
