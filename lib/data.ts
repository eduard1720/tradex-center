import fs from "fs";
import path from "path";
import { parseVideo } from "./video";
import { hasSupabase, getSupabase } from "./supabase";
import type { NewClassInput, TradingClass } from "./types";

/* -------------------------------------------------------------------------- */
/*  Seed data (used by the JSON fallback and by supabase/schema.sql)          */
/* -------------------------------------------------------------------------- */

function rawSeed(): NewClassInput[] {
  return [
    {
      title: "Cómo leer un gráfico de velas desde cero",
      description:
        "Aprende a interpretar velas japonesas, mechas y cuerpos para entender qué está haciendo el precio en cualquier temporalidad.",
      category: "Fundamentos",
      level: "Principiante",
      videoUrl: "https://www.youtube.com/watch?v=p7HKvqRI_Bo",
      durationMin: 24,
      instructor: "Angel Hurtado",
      tags: ["velas", "básico", "gráficos"],
    },
    {
      title: "Soportes y resistencias que de verdad funcionan",
      description:
        "Identifica zonas clave donde el precio reacciona y aprende a operar rebotes y rupturas con confluencia.",
      category: "Análisis Técnico",
      level: "Principiante",
      videoUrl: "https://www.youtube.com/watch?v=hRSjg5GTvDw",
      durationMin: 38,
      instructor: "Angel Hurtado",
      tags: ["soportes", "resistencias"],
    },
    {
      title: "Estructura de mercado y order blocks",
      description:
        "Cómo marcar la estructura, detectar cambios de tendencia (BOS / CHoCH) y operar con order blocks institucionales.",
      category: "Price Action",
      level: "Intermedio",
      videoUrl: "https://www.youtube.com/watch?v=GltlJO56S1g",
      durationMin: 52,
      instructor: "Angel Hurtado",
      tags: ["smc", "order block", "estructura"],
    },
    {
      title: "Gestión de riesgo: nunca pierdas tu cuenta",
      description:
        "Tamaño de posición, ratio riesgo/beneficio, y cómo sobrevivir a una racha de pérdidas sin reventar tu capital.",
      category: "Gestión de Riesgo",
      level: "Principiante",
      videoUrl: "https://www.youtube.com/watch?v=Nb2x4mAvLZA",
      durationMin: 31,
      instructor: "Angel Hurtado",
      tags: ["riesgo", "money management"],
    },
    {
      title: "Psicología del trader: controla el miedo y la avaricia",
      description:
        "Rutinas, journaling y mentalidad para operar con disciplina y dejar de sabotear tus propios setups.",
      category: "Psicología",
      level: "Intermedio",
      videoUrl: "https://www.youtube.com/watch?v=6_b7RDuLwcI",
      durationMin: 27,
      instructor: "Angel Hurtado",
      tags: ["mentalidad", "disciplina"],
    },
    {
      title: "Operando Bitcoin: setups en temporalidad alta",
      description:
        "Análisis de BTC en 4H y diario, niveles macro y cómo planificar entradas swing en cripto.",
      category: "Cripto",
      level: "Avanzado",
      videoUrl: "https://www.youtube.com/watch?v=l1F2dvk3xCc",
      durationMin: 44,
      instructor: "Angel Hurtado",
      tags: ["btc", "swing", "cripto"],
    },
    {
      title: "Sesión en vivo: análisis del mercado de la semana",
      description:
        "Repaso en directo de los pares principales, oportunidades de la semana y preguntas de la comunidad.",
      category: "En Vivo",
      level: "Intermedio",
      videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      durationMin: 68,
      instructor: "Angel Hurtado",
      tags: ["en vivo", "análisis semanal"],
    },
    {
      title: "Forex: las 3 sesiones y cómo aprovechar la volatilidad",
      description:
        "Londres, Nueva York y Asia: a qué hora operar cada par y cómo planificar tu jornada según la sesión.",
      category: "Forex",
      level: "Intermedio",
      videoUrl: "https://www.youtube.com/watch?v=rfscVS0vtbw",
      durationMin: 35,
      instructor: "Angel Hurtado",
      tags: ["forex", "sesiones"],
    },
  ];
}

function hydrate(input: NewClassInput, idx: number): TradingClass {
  const parsed = parseVideo(input.videoUrl);
  const created = new Date(Date.now() - idx * 36 * 60 * 60 * 1000);
  return {
    ...input,
    id: `cl_${(idx + 1).toString().padStart(3, "0")}`,
    embedUrl: parsed.embedUrl,
    thumbnail: parsed.thumbnail,
    createdAt: created.toISOString(),
  };
}

function buildEntry(input: NewClassInput): TradingClass {
  const parsed = parseVideo(input.videoUrl);
  return {
    ...input,
    id: `cl_${Date.now().toString(36)}`,
    embedUrl: parsed.embedUrl,
    thumbnail: parsed.thumbnail,
    createdAt: new Date().toISOString(),
  };
}

/* -------------------------------------------------------------------------- */
/*  Supabase backend (production)                                             */
/* -------------------------------------------------------------------------- */

interface Row {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  video_url: string;
  embed_url: string;
  thumbnail: string;
  duration_min: number;
  instructor: string;
  tags: string[] | null;
  created_at: string;
}

function rowToClass(r: Row): TradingClass {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category as TradingClass["category"],
    level: r.level as TradingClass["level"],
    videoUrl: r.video_url,
    embedUrl: r.embed_url,
    thumbnail: r.thumbnail,
    durationMin: r.duration_min,
    instructor: r.instructor,
    tags: r.tags ?? [],
    createdAt: r.created_at,
  };
}

function classToRow(c: TradingClass): Row {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    category: c.category,
    level: c.level,
    video_url: c.videoUrl,
    embed_url: c.embedUrl,
    thumbnail: c.thumbnail,
    duration_min: c.durationMin,
    instructor: c.instructor,
    tags: c.tags,
    created_at: c.createdAt,
  };
}

const sb = {
  async getAll(): Promise<TradingClass[]> {
    const { data, error } = await getSupabase()
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data as Row[]).map(rowToClass);
  },
  async getById(id: string): Promise<TradingClass | undefined> {
    const { data, error } = await getSupabase()
      .from("classes")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? rowToClass(data as Row) : undefined;
  },
  async add(input: NewClassInput): Promise<TradingClass> {
    const entry = buildEntry(input);
    const { error } = await getSupabase().from("classes").insert(classToRow(entry));
    if (error) throw new Error(error.message);
    return entry;
  },
};

/* -------------------------------------------------------------------------- */
/*  JSON file backend (local development fallback)                            */
/* -------------------------------------------------------------------------- */

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "classes.json");

function ensureFile(): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const seeded = rawSeed().map((c, i) => hydrate(c, i));
    fs.writeFileSync(DATA_FILE, JSON.stringify(seeded, null, 2), "utf-8");
  }
}

const json = {
  getAll(): TradingClass[] {
    ensureFile();
    try {
      const list = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as TradingClass[];
      return list.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      return [];
    }
  },
  add(input: NewClassInput): TradingClass {
    ensureFile();
    const list = json.getAll();
    const entry = buildEntry(input);
    list.unshift(entry);
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
    return entry;
  },
};

/* -------------------------------------------------------------------------- */
/*  Public API — picks the backend automatically                             */
/* -------------------------------------------------------------------------- */

export async function getAllClasses(): Promise<TradingClass[]> {
  return hasSupabase() ? sb.getAll() : json.getAll();
}

export async function getClassById(id: string): Promise<TradingClass | undefined> {
  if (hasSupabase()) return sb.getById(id);
  return json.getAll().find((c) => c.id === id);
}

export async function addClass(input: NewClassInput): Promise<TradingClass> {
  return hasSupabase() ? sb.add(input) : json.add(input);
}

/** Exposed so a seed script / SQL generator can reuse the same demo data. */
export function seedClasses(): TradingClass[] {
  return rawSeed().map((c, i) => hydrate(c, i));
}
