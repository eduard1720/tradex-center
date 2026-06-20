# Hurtado Trader Academy

Plataforma web de formación de trading para **Angel Hurtado**. Angel sube sus clases
grabadas (pegando un link de YouTube o Vimeo) y sus estudiantes las ven dentro de una
interfaz tipo dashboard fintech (tema oscuro, acento naranja) inspirada en el diseño
"Quantum".

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** para los estilos
- **lucide-react** para los iconos
- Persistencia de clases en un archivo JSON (`data/classes.json`) vía API routes.
  Pensado para migrar fácilmente a una base de datos real (Postgres / Supabase).

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre http://localhost:3000

Para producción:

```bash
npm run build
npm start
```

## Estructura

```
app/
  page.tsx            # Inicio / dashboard (progreso, clases recientes)
  clases/             # Biblioteca de clases + filtros
  clases/[id]/        # Reproductor de la clase + playlist
  subir/              # Formulario del instructor para publicar clases
  mercado/            # Explorador de mercado (datos demo)
  rutas/ progreso/ analisis/ comunidad/ ayuda/ ajustes/
  api/clases/         # GET (listar) / POST (crear) clases
components/           # Sidebar, Topbar, tarjetas, gráficos SVG, formulario
lib/                  # Tipos, parseo de video, capa de datos, datos demo
data/classes.json     # "Base de datos" de clases (se genera sola)
```

## Subir una clase

1. Sube el video a YouTube o Vimeo (puede ser **oculto / no listado**).
2. En la plataforma, ve a **Subir clase**, pega el link y completa los datos.
3. La miniatura y el reproductor se generan automáticamente.

## Próximos pasos sugeridos

- Autenticación real (instructor vs. estudiante) — p.ej. NextAuth / Clerk.
- Base de datos (Supabase/Postgres) en lugar del JSON.
- Guardar el progreso real de cada estudiante.
- Datos de mercado en vivo (CoinGecko / Binance) en la sección Mercado.

---

> El contenido es educativo. El trading conlleva riesgo de pérdida de capital.
