import { Instagram, Youtube, Twitter, Send, Music2, Link as LinkIcon, type LucideIcon } from "lucide-react";
import { SITE } from "@/lib/site";

const ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  instagram: { icon: Instagram, label: "Instagram" },
  tiktok: { icon: Music2, label: "TikTok" },
  youtube: { icon: Youtube, label: "YouTube" },
  telegram: { icon: Send, label: "Telegram" },
  x: { icon: Twitter, label: "X" },
  linktree: { icon: LinkIcon, label: "Linktree" },
};

export function SocialLinks({ className = "" }: { className?: string }) {
  const links = Object.entries(SITE.social).filter(([, url]) => url);
  if (links.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(([key, url]) => {
        const meta = ICONS[key];
        if (!meta) return null;
        const Icon = meta.icon;
        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title={meta.label}
            aria-label={meta.label}
            className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-card-soft text-muted transition-colors hover:border-brand/40 hover:text-brand"
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        );
      })}
    </div>
  );
}
