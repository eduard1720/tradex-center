import {
  LayoutGrid,
  PlayCircle,
  Radio,
  MessageSquareQuote,
  NotebookPen,
  Wrench,
  Newspaper,
  LineChart,
  DollarSign,
  Trophy,
  Users,
  Upload,
  UserCog,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Etiqueta alternativa cuando la ve Angel (modo admin). */
  adminLabel?: string;
}

export const MAIN_NAV: NavItem[] = [
  { label: "Bienvenida", href: "/", icon: LayoutGrid },
  { label: "Clases", href: "/clases", icon: PlayCircle },
  { label: "Clases en vivo", href: "/en-vivo", icon: Radio },
  { label: "Comentarios", href: "/comentarios", icon: MessageSquareQuote },
  { label: "Journal", href: "/journal", icon: NotebookPen },
  { label: "Herramientas", href: "/herramientas", icon: Wrench },
  { label: "Noticias", href: "/noticias", icon: Newspaper },
  { label: "Mercado", href: "/mercado", icon: LineChart },
  { label: "Dólar paralelo", href: "/dolar", icon: DollarSign },
  { label: "Mi progreso", href: "/progreso", icon: Trophy, adminLabel: "Progreso de alumnos" },
  { label: "Comunidad", href: "/comunidad", icon: Users, adminLabel: "Gestión de comunidad" },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Subir clase", href: "/subir", icon: Upload },
  { label: "Alumnos", href: "/alumnos", icon: UserCog },
];
