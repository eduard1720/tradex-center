import { FileText } from "lucide-react";
import { getSetting } from "@/lib/settings";
import { DEFAULT_TERMS } from "@/lib/terms";

export const metadata = { title: "Términos y condiciones — TradeX Center" };
export const dynamic = "force-dynamic";

export default async function TerminosPage() {
  const saved = await getSetting("terms_text");
  const terms = saved && saved.trim() ? saved : DEFAULT_TERMS;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <div>
        <p className="inline-flex items-center gap-1.5 text-sm text-brand">
          <FileText className="h-4 w-4" /> Documento legal
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Términos y condiciones
        </h1>
      </div>

      <div className="card whitespace-pre-line p-6 text-sm leading-relaxed text-muted">
        {terms}
      </div>
    </div>
  );
}
