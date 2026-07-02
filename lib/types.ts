export type Level = "Principiante" | "Intermedio" | "Avanzado";

/** La categoría es texto libre: Angel escribe la que quiera al subir la clase. */
export type Category = string;

/** Sugerencias de categoría (se ofrecen como autocompletado, no son obligatorias). */
export const CATEGORIES: string[] = [
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
  /** Miniatura efectiva que se muestra (personalizada si existe, si no la del video). */
  thumbnail: string;
  /** Miniatura personalizada que subió/pegó Angel (vacío = usar la del video). */
  thumbnailCustom: string;
  /** Miniatura del módulo al que pertenece (vacío = usar la de la 1ª clase). */
  moduleThumbnail: string;
  instructor: string;
  tags: string[];
  createdAt: string;
  /** Número de módulo al que pertenece la clase (1, 2, 3...).
   *  Las clases en vivo y sin módulo usan 0. */
  module: number;
  /** Título del módulo (ej. "Fundamentos del Trading"). */
  moduleTitle: string;
  /** Posición de la clase dentro del módulo (1, 2, 3...). */
  order: number;
}

export type NewClassInput = Omit<
  TradingClass,
  "id" | "embedUrl" | "thumbnail" | "createdAt" | "order"
>;
// thumbnailCustom y moduleThumbnail sí forman parte de la entrada (opcionales: "").
