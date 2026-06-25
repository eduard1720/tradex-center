import { MessageCircle, ArrowUpRight, Users } from "lucide-react";
import { SITE, waLink } from "@/lib/site";

export const metadata = { title: "Comunidad — TradeX Center" };

export default function ComunidadPage() {
  // Si hay link de grupo, se usa; si no, abre el chat directo con Angel.
  const communityUrl =
    SITE.whatsappGroup ||
    waLink(`Hola Angel, quiero unirme a la comunidad de ${SITE.name}.`);

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-sm text-muted">Aprende en compañía</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Comunidad</h1>
      </div>

      <a
        href={communityUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="card group relative flex flex-col items-center gap-4 overflow-hidden p-10 text-center transition-colors hover:border-brand/40"
      >
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-brand text-black shadow-glow">
          <MessageCircle className="h-8 w-8" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-white">Únete al grupo de WhatsApp</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Comparte ideas, recibe avisos de las clases en vivo y resuelve tus dudas con Angel
            y el resto de la comunidad.
          </p>
        </div>
        <span className="btn-primary">
          Entrar a la comunidad <ArrowUpRight className="h-4 w-4" />
        </span>
        <p className="inline-flex items-center gap-1.5 text-xs text-muted">
          <Users className="h-3.5 w-3.5" /> Solo para miembros activos
        </p>
      </a>
    </div>
  );
}
