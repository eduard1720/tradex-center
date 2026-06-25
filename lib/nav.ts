import {
  LayoutGrid,
  PlayCircle,
  Radio,
  Newspaper,
  Sparkles,
  LineChart,
  Trophy,
  Users,
  Upload,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const MAIN_NAV: NavItem[] = [
  { label: "Inicio", href: "/", icon: LayoutGrid },
  { label: "Clases", href: "/clases", icon: PlayCircle },
  { label: "Clases en vivo", href: "/en-vivo", icon: Radio },
  { label: "Noticias", href: "/noticias", icon: Newspaper },
  { label: "Análisis IA", href: "/analisis", icon: Sparkles },
  { label: "Mercado", href: "/mercado", icon: LineChart },
  { label: "Mi progreso", href: "/progreso", icon: Trophy },
  { label: "Comunidad", href: "/comunidad", icon: Users },
];

export const ADMIN_NAV: NavItem[] = [
  { label: "Subir clase", href: "/subir", icon: Upload },
];
