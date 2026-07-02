import { Quote } from "lucide-react";
import { SITE } from "@/lib/site";
import { getSetting } from "@/lib/settings";
import { listComments } from "@/lib/comments";
import { WelcomeVideo } from "@/components/WelcomeVideo";
import { SocialLinks } from "@/components/SocialLinks";

export const dynamic = "force-dynamic";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default async function DashboardPage() {
  const [welcomeUrl, comments] = await Promise.all([
    getSetting("welcome_video"),
    listComments(false), // solo los aprobados por Angel
  ]);
  const featured = comments.slice(0, 6);

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-fade-up">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Un mensaje de Angel para ti
        </h1>
        <p className="mt-1 text-sm text-muted">Bienvenido a {SITE.name}</p>
      </div>

      <WelcomeVideo initialUrl={welcomeUrl} />

      <div className="flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs text-muted">Sígueme en mis redes:</span>
        <SocialLinks />
      </div>

      {/* Comentarios de alumnos (los que Angel aprueba) */}
      {featured.length > 0 && (
        <div className="space-y-4 border-t border-line pt-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">Lo que dicen los alumnos</h2>
            <p className="text-sm text-muted">Experiencias reales de la comunidad</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {featured.map((c) => (
              <div key={c.id} className="card relative p-5">
                <Quote className="absolute right-4 top-4 h-7 w-7 text-brand/15" />
                <p className="line-clamp-6 break-words pr-6 text-sm leading-relaxed text-white/90">“{c.body}”</p>
                <div className="mt-4 flex items-center gap-3 border-t border-line pt-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-xs font-semibold text-white/80">
                    {initials(c.authorName)}
                  </span>
                  <p className="min-w-0 truncate text-sm font-medium text-white">{c.authorName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
