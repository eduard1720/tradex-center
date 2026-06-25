import { MessageCircle, Trophy, Users, Pin, Heart, ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata = { title: "Comunidad — TradeX Center" };

const LEADERS = [
  { name: "María G.", pts: 4820, you: false },
  { name: "Carlos R.", pts: 4510, you: false },
  { name: "Tú", pts: 3990, you: true },
  { name: "Lucía P.", pts: 3760, you: false },
  { name: "Diego M.", pts: 3420, you: false },
];

const THREADS = [
  { author: "Angel Hurtado", role: "Instructor", title: "📌 Reglas de la comunidad y cómo aprovechar las clases", replies: 42, likes: 318, pinned: true },
  { author: "María G.", role: "Estudiante", title: "Mi setup de esta semana en BTC — ¿qué opinan?", replies: 17, likes: 64, pinned: false },
  { author: "Diego M.", role: "Estudiante", title: "Duda sobre order blocks vs zonas de oferta", replies: 9, likes: 21, pinned: false },
  { author: "Lucía P.", role: "Estudiante", title: "Comparto mi journal de trading del mes 🚀", replies: 23, likes: 88, pinned: false },
];

export default function ComunidadPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <p className="text-sm text-muted">Aprende en compañía</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Comunidad</h1>
      </div>

      {/* Unirse al grupo de WhatsApp */}
      <a
        href={SITE.whatsappGroup}
        target="_blank"
        rel="noopener noreferrer"
        className="card group relative flex flex-wrap items-center justify-between gap-4 overflow-hidden p-6 transition-colors hover:border-brand/40"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-black shadow-glow">
            <MessageCircle className="h-7 w-7" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">Únete al grupo de WhatsApp</h2>
            <p className="mt-0.5 text-sm text-muted">
              Comparte ideas, recibe avisos de clases en vivo y resuelve dudas con Angel y la comunidad.
            </p>
          </div>
        </div>
        <span className="btn-primary shrink-0">
          Entrar al grupo <ArrowUpRight className="h-4 w-4" />
        </span>
      </a>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: Users, label: "Miembros", value: "1,248" },
          { icon: MessageCircle, label: "Mensajes hoy", value: "327" },
          { icon: Trophy, label: "Tu posición", value: "#142" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card flex items-center gap-4 p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xl font-semibold text-white">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Discussions */}
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Discusiones recientes</h2>
            <button className="btn-primary !py-2 !px-4 text-sm">Nuevo tema</button>
          </div>
          <div className="divide-y divide-line">
            {THREADS.map((t) => (
              <div key={t.title} className="flex items-start gap-3 py-3.5">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/20 text-xs font-bold text-brand">
                  {t.author.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-white">
                    {t.pinned && <Pin className="h-3.5 w-3.5 text-brand" />}
                    {t.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {t.author}
                    {t.role === "Instructor" && (
                      <span className="ml-1.5 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-medium text-brand">
                        Instructor
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
                  <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {t.likes}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {t.replies}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card p-5">
          <h2 className="mb-4 text-base font-semibold text-white">Ranking semanal</h2>
          <div className="space-y-2">
            {LEADERS.map((l, i) => (
              <div
                key={l.name}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                  l.you ? "bg-brand-soft" : "bg-card-soft"
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-lg text-xs font-bold ${
                    i < 3 ? "bg-brand text-black" : "bg-card text-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`flex-1 text-sm ${l.you ? "font-semibold text-white" : "text-white/90"}`}>
                  {l.name}
                </span>
                <span className="text-sm font-medium text-brand">{l.pts.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
