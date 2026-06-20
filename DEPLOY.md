# 🚀 Desplegar en Vercel (con Supabase)

Sigue estos 3 bloques en orden. La primera vez toma ~10 minutos.

---

## 1) Crear la base de datos en Supabase

1. Entra a <https://supabase.com> → **New project** (plan Free).
   - Ponle un nombre (ej. `hurtado-trader`) y una contraseña de base de datos.
2. Espera a que el proyecto termine de crearse (~1 min).
3. Ve a **SQL Editor** → **New query**, pega TODO el contenido de
   [`supabase/schema.sql`](supabase/schema.sql) y pulsa **Run**.
   - Esto crea la tabla `classes` y carga las 8 clases de ejemplo.
4. Ve a **Project Settings → API** y copia dos valores (los usarás en el paso 3):
   - **Project URL** → `SUPABASE_URL`
   - **Project API keys → `service_role`** (el secreto) → `SUPABASE_SERVICE_ROLE_KEY`

---

## 2) Subir el código a GitHub

1. Crea un repositorio **vacío** en <https://github.com/new>
   (sin README, sin .gitignore) — por ejemplo `hurtado-trader`.
2. En esta carpeta del proyecto, ejecuta (cambia la URL por la de tu repo):

   ```bash
   git remote add origin https://github.com/TU-USUARIO/hurtado-trader.git
   git push -u origin main
   ```

   > La primera vez, Git te pedirá iniciar sesión en GitHub (se abre el navegador).

---

## 3) Conectar Vercel

1. Entra a <https://vercel.com> e inicia sesión **con GitHub**.
2. **Add New → Project** → importa el repo `hurtado-trader`.
3. Vercel detecta Next.js automáticamente. Antes de desplegar, abre
   **Environment Variables** y añade estas dos (las del paso 1):

   | Name | Value |
   |------|-------|
   | `SUPABASE_URL` | tu Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | tu service_role key |

4. Pulsa **Deploy**. En ~1–2 min tendrás tu URL pública
   (ej. `https://hurtado-trader.vercel.app`).

A partir de aquí, **cada `git push` despliega automáticamente.**

---

## Notas

- **Subidas de Angel:** funcionan en producción porque se guardan en Supabase.
- **Desarrollo local:** si no defines las variables, la app usa un archivo JSON
  local (`data/classes.json`) automáticamente. Para usar Supabase también en
  local, copia `.env.example` a `.env.local` y rellena los valores.
- La `service_role key` es **secreta**: solo se usa en el servidor, nunca se
  expone al navegador. No la subas a GitHub (por eso está en variables de Vercel).
