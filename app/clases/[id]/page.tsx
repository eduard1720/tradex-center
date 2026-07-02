import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BarChart3,
  PlayCircle,
  Bookmark,
  ArrowLeft,
  Layers,
} from "lucide-react";
import { getAllClasses, getClassById } from "@/lib/data";
import { getResources } from "@/lib/resources";
import { VideoPlayer } from "@/components/VideoPlayer";
import { LessonResources } from "@/components/LessonResources";
import { Linkify } from "@/components/Linkify";
import { parseVideo } from "@/lib/video";
import type { TradingClass } from "@/lib/types";

export const dynamic = "force-dynamic";

const levelTone: Record<string, string> = {
  Principiante: "text-pos border-pos/30 bg-pos/10",
  Intermedio: "text-brand border-brand/30 bg-brand/10",
  Avanzado: "text-neg border-neg/30 bg-neg/10",
};

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cls = await getClassById(id);
  if (!cls) notFound();

  const resources = await getResources(cls.id);
  const moduleLabel =
    cls.module > 0
      ? `Módulo ${cls.module}${cls.moduleTitle ? ` · ${cls.moduleTitle}` : ""} · ${cls.title}`
      : cls.title;

  const all = await getAllClasses();
  // Clases del mismo módulo (la "ruta" de esta clase), en orden.
  const sameModule = all
    .filter((c) => c.module === cls.module && c.id !== cls.id)
    .sort((a, b) => a.order - b.order);
  const playlist = (sameModule.length ? sameModule : all.filter((c) => c.id !== cls.id)).slice(0, 6);

  return (
    <div className="space-y-5 animate-fade-up">
      <Link
        href="/clases"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a clases
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Player + info */}
        <div className="space-y-5 lg:col-span-2">
          <div className="mx-auto w-full max-w-2xl">
            <VideoPlayer
              classId={cls.id}
              provider={parseVideo(cls.videoUrl).provider}
              videoId={parseVideo(cls.videoUrl).id}
              embedUrl={cls.embedUrl}
              title={cls.title}
            />
          </div>

          <div className="card p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-line bg-card-soft px-2.5 py-1 text-xs text-muted">
                {cls.category}
              </span>
              {cls.module > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
                  <Layers className="h-3.5 w-3.5" /> Módulo {cls.module}
                  {cls.moduleTitle ? ` · ${cls.moduleTitle}` : ""}
                </span>
              )}
              <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${levelTone[cls.level]}`}>
                {cls.level}
              </span>
            </div>

            <h1 className="mt-3 text-xl font-semibold tracking-tight text-white md:text-2xl">
              {cls.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/20 text-xs font-bold text-brand">
                  {cls.instructor.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-medium text-white">{cls.instructor}</p>
                  <p className="text-xs text-muted">Instructor · TradeX Center</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-ghost"><Bookmark className="h-4 w-4" /> Guardar</button>
              </div>
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <h2 className="text-sm font-semibold text-white">Sobre esta clase</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">
                <Linkify text={cls.description} />
              </p>
              {cls.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {cls.tags.map((t) => (
                    <span key={t} className="rounded-md bg-card-soft px-2.5 py-1 text-xs text-muted">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <LessonResources classId={cls.id} target={moduleLabel} resources={resources} />
          </div>
        </div>

        {/* Playlist */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Siguiente en el módulo</h2>
              <span className="text-xs text-muted">{playlist.length} clases</span>
            </div>
            <div className="flex flex-col gap-1">
              {playlist.map((p, i) => (
                <PlaylistRow key={p.id} cls={p} index={i + 1} />
              ))}
            </div>
            <Link
              href="/clases"
              className="mt-3 block rounded-xl border border-line py-2.5 text-center text-sm text-muted hover:text-white"
            >
              Ver todos los módulos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaylistRow({ cls, index }: { cls: TradingClass; index: number }) {
  return (
    <Link
      href={`/clases/${cls.id}`}
      className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-card-hover"
    >
      <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-card-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cls.thumbnail} alt={cls.title} className="h-full w-full object-cover" />
        <span className="absolute inset-0 grid place-items-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <PlayCircle className="h-6 w-6 text-white" />
        </span>
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-white group-hover:text-brand">
          {index}. {cls.title}
        </p>
        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted">
          <BarChart3 className="h-3 w-3" /> {cls.level}
        </p>
      </div>
    </Link>
  );
}
