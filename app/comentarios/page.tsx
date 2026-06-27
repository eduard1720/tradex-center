import { Star } from "lucide-react";
import { CommentsBoard } from "@/components/CommentsBoard";

export const metadata = { title: "Comentarios — TradeX Center" };

export default function ComentariosPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="inline-flex items-center gap-1.5 text-sm text-brand">
          <Star className="h-4 w-4 fill-brand" /> Historias de alumnos
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Comentarios
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Lo que dicen los alumnos de Angel. Comparte tu experiencia y ayuda a otros a dar el paso.
        </p>
      </div>

      <CommentsBoard />
    </div>
  );
}
