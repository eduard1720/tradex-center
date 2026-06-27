import { SITE } from "@/lib/site";
import { getSetting } from "@/lib/settings";
import { WelcomeVideo } from "@/components/WelcomeVideo";
import { SocialLinks } from "@/components/SocialLinks";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const welcomeUrl = await getSetting("welcome_video");

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <div className="text-center">
        <p className="text-sm text-muted">Bienvenido a {SITE.name} 👋</p>
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
          Un mensaje de Angel para ti
        </h1>
      </div>

      <WelcomeVideo initialUrl={welcomeUrl} />

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <span className="text-xs text-muted">Sígueme en mis redes:</span>
        <SocialLinks />
      </div>
    </div>
  );
}
