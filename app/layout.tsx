import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TradeX Center — Clases de trading",
  description:
    "Plataforma de formación de trading de Angel Hurtado. Clases en módulos, clases en vivo, noticias del mercado y comunidad.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="app-backdrop min-h-screen font-sans text-white antialiased">
        <div className="flex">
          <Sidebar />
          <div className="flex min-h-screen w-full min-w-0 flex-col">
            <Topbar />
            <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-8">
              {children}
            </main>
            <footer className="border-t border-line px-4 py-6 text-center text-xs text-muted md:px-8">
              © {new Date().getFullYear()} TradeX Center · Hecho para Angel Hurtado ·
              El trading conlleva riesgo de pérdida de capital.
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
