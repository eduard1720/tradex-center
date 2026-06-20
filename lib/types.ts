export type Level = "Principiante" | "Intermedio" | "Avanzado";

export type Category =
  | "Fundamentos"
  | "Análisis Técnico"
  | "Price Action"
  | "Gestión de Riesgo"
  | "Psicología"
  | "Cripto"
  | "Forex"
  | "En Vivo";

export const CATEGORIES: Category[] = [
  "Fundamentos",
  "Análisis Técnico",
  "Price Action",
  "Gestión de Riesgo",
  "Psicología",
  "Cripto",
  "Forex",
  "En Vivo",
];

export const LEVELS: Level[] = ["Principiante", "Intermedio", "Avanzado"];

export interface TradingClass {
  id: string;
  title: string;
  description: string;
  category: Category;
  level: Level;
  /** Original URL the instructor pasted (YouTube or Vimeo). */
  videoUrl: string;
  /** Normalized embeddable URL. */
  embedUrl: string;
  /** Thumbnail derived from the video provider. */
  thumbnail: string;
  durationMin: number;
  instructor: string;
  tags: string[];
  createdAt: string;
}

export type NewClassInput = Omit<
  TradingClass,
  "id" | "embedUrl" | "thumbnail" | "createdAt"
>;
