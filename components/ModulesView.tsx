"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  CheckCircle2,
  PlayCircle,
  BarChart3,
  ChevronRight,
  ArrowLeft,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import type { TradingClass } from "@/lib/types";
import { getCompleted, onProgressChange } from "@/lib/progress";
import { useAdmin, getAdminPw } from "@/lib/admin";
import { ClassEditModal } from "@/components/ClassEditModal";
import { ModuleThumbnailModal } from "@/components/ModuleThumbnailModal";

interface ModuleGroup {
  module: number;
  title: string;
  thumbnail: string;
  lessons: TradingClass[];
}

function buildModules(classes: TradingClass[]): ModuleGroup[] {
  const map = new Map<number, ModuleGroup>();
  for (const c of classes) {
    if (c.module <= 0) continue; // las clases en vivo no entran en módulos
    if (!map.has(c.module)) {
      map.set(c.module, {
        module: c.module,
        title: c.moduleTitle || `Módulo ${c.module}`,
        thumbnail: "",
        lessons: [],
      });
    }
    const g = map.get(c.module)!;
    g.lessons.push(c);
    if (!g.thumbnail && c.moduleThumbnail) g.thumbnail = c.moduleThumbnail;
  }
  const groups = [...map.values()].sort((a, b) => a.module - b.module);
  for (const g of groups) g.lessons.sort((a, b) => a.order - b.order);
  return groups;
}

export function ModulesView({ classes }: { classes: TradingClass[] }) {
  const modules = useMemo(() => buildModules(classes), [classes]);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const isAdmin = useAdmin();
  const router = useRouter();
  const [editing, setEditing] = useState<TradingClass | null>(null);
  const [editThumb, setEditThumb] = useState<ModuleGroup | null>(null);
  const [openModule, setOpenModule] = useState<number | null>(null);

  useEffect(() => {
    const sync = () => setCompleted(getCompleted());
    sync();
    setReady(true);
    return onProgressChange(sync);
  }, []);

  const moduleDone = (g: ModuleGroup) => g.lessons.every((l) => completed.has(l.id));
  const doneCountOf = (g: ModuleGroup) => g.lessons.filter((l) => completed.has(l.id)).length;
  const isUnlocked = (mi: number) => isAdmin || mi === 0 || moduleDone(modules[mi - 1]);

  async function deleteLesson(id: string) {
    if (!window.confirm("¿Eliminar esta clase? No se puede deshacer.")) return;
    await fetch(`/api/clases?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    router.refresh();
  }

  async function renameModuleHandler(module: number, current: string) {
    const title = window.prompt("Nuevo nombre del módulo:", current);
    if (!title || !title.trim()) return;
    await fetch("/api/modulos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-password": getAdminPw() ?? "" },
      body: JSON.stringify({ module, title: title.trim() }),
    });
    router.refresh();
  }

  async function deleteModuleHandler(module: number) {
    if (!window.confirm(`¿Eliminar el Módulo ${module} y TODAS sus clases? No se puede deshacer.`)) return;
    await fetch(`/api/modulos?module=${module}`, {
      method: "DELETE",
      headers: { "x-admin-password": getAdminPw() ?? "" },
    });
    setOpenModule(null);
    router.refresh();
  }

  if (modules.length === 0) {
    return (
      <div className="card grid place-items-center py-16 text-center">
        <p className="text-muted">Aún no hay clases en módulos. Angel las publicará pronto.</p>
      </div>
    );
  }

  const detailIndex =
    openModule != null ? modules.findIndex((m) => m.module === openModule) : -1;
  const detail = detailIndex >= 0 ? modules[detailIndex] : null;

  /* ------------------------------ Detalle del módulo ------------------------ */
  if (detail) {
    const moduleUnlocked = isUnlocked(detailIndex);
    const doneCount = doneCountOf(detail);
    const pct = Math.round((doneCount / detail.lessons.length) * 100);

    return (
      <>
        <div className="animate-fade-up space-y-5">
          <button
            onClick={() => setOpenModule(null)}
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Volver a los módulos
          </button>

          <div className="card overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-sm font-bold text-black">
                  {detail.module}
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted">
                    Módulo {detail.module}
                  </p>
                  <h2 className="text-lg font-semibold text-white">{detail.title}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => renameModuleHandler(detail.module, detail.title)}
                      title="Renombrar módulo"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-white"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setEditThumb(detail)}
                      title="Cambiar miniatura del módulo"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-white"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteModuleHandler(detail.module)}
                      title="Eliminar módulo"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-neg/40 hover:text-neg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="text-right">
                  <p className="font-mono text-sm font-medium text-white">
                    {doneCount}/{detail.lessons.length}
                  </p>
                  <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-card-soft">
                    <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {!moduleUnlocked && (
              <div className="flex items-center gap-2 bg-card-soft/40 px-5 py-2.5 text-xs text-muted">
                <Lock className="h-3.5 w-3.5" />
                Completa el módulo anterior para desbloquear estas clases.
              </div>
            )}

            <ul className="divide-y divide-line">
              {detail.lessons.map((lesson, li) => {
                const isDone = completed.has(lesson.id);
                const prevDone = li === 0 || completed.has(detail.lessons[li - 1].id);
                const unlocked = moduleUnlocked && (isAdmin || prevDone);
                return (
                  <li key={lesson.id} className="flex items-center">
                    <div className="min-w-0 flex-1">
                      <LessonRow
                        lesson={lesson}
                        index={li + 1}
                        done={isDone}
                        unlocked={unlocked}
                        ready={ready}
                      />
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-1 pr-4">
                        <button
                          onClick={() => setEditing(lesson)}
                          title="Editar clase"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteLesson(lesson.id)}
                          title="Eliminar clase"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-neg/40 hover:text-neg"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {editing && (
          <ClassEditModal
            cls={editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              router.refresh();
            }}
          />
        )}

        {editThumb && (
          <ModuleThumbnailModal
            module={editThumb.module}
            title={editThumb.title}
            current={editThumb.thumbnail}
            fallback={editThumb.lessons.find((l) => l.thumbnail)?.thumbnail ?? ""}
            onClose={() => setEditThumb(null)}
            onSaved={() => {
              setEditThumb(null);
              router.refresh();
            }}
          />
        )}
      </>
    );
  }

  /* ------------------------------- Grilla de cards -------------------------- */
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((g, mi) => {
        const moduleUnlocked = isUnlocked(mi);
        const doneCount = doneCountOf(g);
        const pct = Math.round((doneCount / g.lessons.length) * 100);
        const done = doneCount === g.lessons.length;
        const cover = g.thumbnail || g.lessons.find((l) => l.thumbnail)?.thumbnail;

        return (
          <button
            key={g.module}
            type="button"
            disabled={!moduleUnlocked}
            onClick={() => setOpenModule(g.module)}
            title={moduleUnlocked ? undefined : "Completa el módulo anterior para desbloquear"}
            className={`card group flex flex-col overflow-hidden p-0 text-left transition-colors duration-150 ${
              moduleUnlocked ? "hover:border-white/15" : "cursor-not-allowed opacity-70"
            }`}
          >
            {/* Portada */}
            <div className="relative aspect-video w-full overflow-hidden bg-card-soft">
              {cover ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={cover}
                  alt=""
                  className={`h-full w-full object-cover transition-transform duration-300 ${
                    moduleUnlocked ? "group-hover:scale-105" : "grayscale"
                  }`}
                />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-to-br from-card-soft to-bg">
                  <span className="font-mono text-5xl font-semibold text-white/10">
                    {String(g.module).padStart(2, "0")}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                Módulo {g.module}
              </span>
              {!moduleUnlocked ? (
                <span className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-muted backdrop-blur-sm">
                  <Lock className="h-3.5 w-3.5" />
                </span>
              ) : done ? (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-pos/20 px-2 py-0.5 text-[11px] font-medium text-pos backdrop-blur-sm">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completado
                </span>
              ) : null}
            </div>

            {/* Cuerpo */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-sm font-semibold leading-snug text-white">{g.title}</h3>
              <div className="mt-auto pt-3">
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>{doneCount}/{g.lessons.length} clases</span>
                  <span className="font-mono tabular-nums">{pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-card-soft">
                  <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function LessonRow({
  lesson,
  index,
  done,
  unlocked,
  ready,
}: {
  lesson: TradingClass;
  index: number;
  done: boolean;
  unlocked: boolean;
  ready: boolean;
}) {
  const inner = (
    <div
      className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
        unlocked ? "hover:bg-card-hover" : "cursor-not-allowed"
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-semibold ${
          done
            ? "bg-pos/15 text-pos"
            : unlocked
            ? "bg-brand-soft text-brand"
            : "bg-card-soft text-muted"
        }`}
      >
        {done ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : unlocked ? (
          <PlayCircle className="h-4 w-4" />
        ) : (
          <Lock className="h-3.5 w-3.5" />
        )}
      </span>

      {lesson.thumbnail && (
        <div className="relative aspect-video w-16 shrink-0 overflow-hidden rounded-md border border-line bg-card-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lesson.thumbnail}
            alt=""
            className={`h-full w-full object-cover ${unlocked ? "" : "opacity-40 grayscale"}`}
          />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium ${unlocked ? "text-white" : "text-muted"}`}>
          {index}. {lesson.title}
        </p>
        <p className="mt-0.5 inline-flex items-center gap-1.5 text-[11px] text-muted">
          <BarChart3 className="h-3 w-3" /> {lesson.level}
          {done && <span className="ml-1 text-pos">· Completada</span>}
        </p>
      </div>

      {unlocked ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-muted" />
      ) : (
        <span className="shrink-0 text-[11px] text-muted">{ready ? "Bloqueada" : ""}</span>
      )}
    </div>
  );

  if (!unlocked) return inner;
  return (
    <Link href={`/clases/${lesson.id}`} className="block">
      {inner}
    </Link>
  );
}
