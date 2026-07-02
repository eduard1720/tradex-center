-- TradeX Center — esquema de Supabase
-- Ejecuta este archivo una sola vez en:  Supabase  ->  SQL Editor  ->  New query
-- Crea la tabla "classes" y carga las clases de demostración.

create table if not exists public.classes (
  id           text primary key,
  title        text not null,
  description  text not null,
  category     text not null,
  level        text not null,
  video_url    text not null,
  embed_url    text not null,
  thumbnail    text not null,
  duration_min integer not null,
  instructor   text not null default 'Angel Hurtado',
  tags         text[] not null default '{}',
  created_at   timestamptz not null default now(),
  module       integer not null default 0,
  module_title text not null default '',
  lesson_order integer not null default 0
);

-- Por si la tabla ya existía de una versión anterior, añade las columnas nuevas.
alter table public.classes add column if not exists module       integer not null default 0;
alter table public.classes add column if not exists module_title text not null default '';
alter table public.classes add column if not exists lesson_order integer not null default 0;
-- La duración de clases se eliminó: la columna queda opcional (puede ser null).
alter table public.classes alter column duration_min drop not null;

-- Seguridad: lectura pública, escritura solo desde el servidor (service role).
alter table public.classes enable row level security;

drop policy if exists "Lectura publica de clases" on public.classes;
create policy "Lectura publica de clases"
  on public.classes for select
  using (true);

-- ---------------------------------------------------------------------------
-- Histórico del dólar paralelo (snapshots intradía, ~1 cada 10 min).
-- ---------------------------------------------------------------------------
create table if not exists public.dolar_snapshots (
  id   bigserial primary key,
  ts   timestamptz not null default now(),
  buy  numeric not null,
  sell numeric not null,
  avg  numeric not null
);
create index if not exists dolar_snapshots_ts_idx on public.dolar_snapshots (ts desc);
alter table public.dolar_snapshots enable row level security;
drop policy if exists "Lectura publica dolar" on public.dolar_snapshots;
create policy "Lectura publica dolar"
  on public.dolar_snapshots for select
  using (true);

-- ---------------------------------------------------------------------------
-- Clases en vivo programadas por Angel (modo admin).
-- ---------------------------------------------------------------------------
create table if not exists public.live_sessions (
  id         bigserial primary key,
  title      text not null,
  starts_at  timestamptz not null,
  link       text not null default '',
  created_at timestamptz not null default now()
);
alter table public.live_sessions enable row level security;
drop policy if exists "Lectura publica en vivo" on public.live_sessions;
create policy "Lectura publica en vivo"
  on public.live_sessions for select
  using (true);

-- ---------------------------------------------------------------------------
-- Herramientas: archivos (PDF, diapositivas, libros…) que sube Angel.
-- ---------------------------------------------------------------------------
create table if not exists public.resources (
  id         bigserial primary key,
  title      text not null,
  file_name  text not null,
  file_url   text not null,
  path       text not null,
  kind       text not null default 'file',
  target     text not null default '',
  class_id   text not null default '',
  created_at timestamptz not null default now()
);
-- Para tablas ya existentes: añade la columna "target" (a qué módulo/lección va dirigido).
alter table public.resources add column if not exists target text not null default '';
-- class_id: a qué clase/lección pertenece el material (vacío = material general).
alter table public.resources add column if not exists class_id text not null default '';
alter table public.resources enable row level security;
drop policy if exists "Lectura publica recursos" on public.resources;
create policy "Lectura publica recursos"
  on public.resources for select
  using (true);

-- Bucket de Storage público donde se guardan los archivos de Herramientas.
insert into storage.buckets (id, name, public)
values ('herramientas', 'herramientas', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Alumnos: cada uno tiene un código de acceso. Angel los da de alta y puede
-- desactivar (active=false) para revocar el acceso de uno solo.
-- ---------------------------------------------------------------------------
create table if not exists public.students (
  id                bigserial primary key,
  name              text not null,
  code              text not null unique,
  active            boolean not null default true,
  terms_accepted_at timestamptz,
  created_at        timestamptz not null default now()
);
alter table public.students enable row level security;
-- Sin políticas de lectura pública: la validación del código se hace en el
-- servidor con la service role key (login de alumnos).

-- ---------------------------------------------------------------------------
-- Comentarios de alumnos. Angel modera cuáles se muestran (approved=true).
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id          bigserial primary key,
  student_id  bigint references public.students(id) on delete set null,
  author_name text not null,
  body        text not null,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists comments_created_idx on public.comments (created_at desc);
alter table public.comments enable row level security;
drop policy if exists "Lectura publica comentarios aprobados" on public.comments;
create policy "Lectura publica comentarios aprobados"
  on public.comments for select
  using (approved = true);

-- ---------------------------------------------------------------------------
-- Ajustes del sitio (clave/valor): video de bienvenida, texto de T&C, etc.
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key   text primary key,
  value text not null default ''
);
alter table public.settings enable row level security;
drop policy if exists "Lectura publica ajustes" on public.settings;
create policy "Lectura publica ajustes"
  on public.settings for select
  using (true);

-- ---------------------------------------------------------------------------
-- Journal de trading: operaciones que registra cada alumno.
-- ---------------------------------------------------------------------------
create table if not exists public.journal_entries (
  id            bigserial primary key,
  student_id    bigint not null references public.students(id) on delete cascade,
  entry_date    date not null,
  asset         text not null,
  direction     text not null default 'long',
  outcome       text not null default 'be',
  risk_reward   text not null default '',
  notes         text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists journal_student_idx on public.journal_entries (student_id, entry_date desc);
alter table public.journal_entries enable row level security;
-- Sin lectura pública: se accede solo desde el servidor con el código del alumno.

-- ---------------------------------------------------------------------------
-- Progreso del alumno: una fila por clase completada.
-- ---------------------------------------------------------------------------
create table if not exists public.progress (
  id           bigserial primary key,
  student_id   bigint not null references public.students(id) on delete cascade,
  class_id     text not null,
  completed_at timestamptz not null default now(),
  unique (student_id, class_id)
);
create index if not exists progress_student_idx on public.progress (student_id);
alter table public.progress enable row level security;
-- Sin lectura pública: se accede solo desde el servidor con el código del alumno.

-- ---------------------------------------------------------------------------
-- Datos de demostración (8 clases en módulos). Cámbialos o bórralos cuando quieras.
-- ---------------------------------------------------------------------------
insert into public.classes
  (id, title, description, category, level, video_url, embed_url, thumbnail, duration_min, instructor, tags, created_at, module, module_title, lesson_order)
values
  ('cl_001', 'Cómo leer un gráfico de velas desde cero',
   'Aprende a interpretar velas japonesas, mechas y cuerpos para entender qué está haciendo el precio en cualquier temporalidad.',
   'Fundamentos', 'Principiante',
   'https://www.youtube.com/watch?v=p7HKvqRI_Bo',
   'https://www.youtube.com/embed/p7HKvqRI_Bo?rel=0&modestbranding=1',
   'https://i.ytimg.com/vi/p7HKvqRI_Bo/hqdefault.jpg',
   24, 'Angel Hurtado', ARRAY['velas','básico','gráficos'], now() - interval '0 hours',
   1, 'Fundamentos del Trading', 1),

  ('cl_002', 'Soportes y resistencias que de verdad funcionan',
   'Identifica zonas clave donde el precio reacciona y aprende a operar rebotes y rupturas con confluencia.',
   'Análisis Técnico', 'Principiante',
   'https://www.youtube.com/watch?v=hRSjg5GTvDw',
   'https://www.youtube.com/embed/hRSjg5GTvDw?rel=0&modestbranding=1',
   'https://i.ytimg.com/vi/hRSjg5GTvDw/hqdefault.jpg',
   38, 'Angel Hurtado', ARRAY['soportes','resistencias'], now() - interval '36 hours',
   1, 'Fundamentos del Trading', 2),

  ('cl_003', 'Estructura de mercado y order blocks',
   'Cómo marcar la estructura, detectar cambios de tendencia (BOS / CHoCH) y operar con order blocks institucionales.',
   'Price Action', 'Intermedio',
   'https://www.youtube.com/watch?v=GltlJO56S1g',
   'https://www.youtube.com/embed/GltlJO56S1g?rel=0&modestbranding=1',
   'https://i.ytimg.com/vi/GltlJO56S1g/hqdefault.jpg',
   52, 'Angel Hurtado', ARRAY['smc','order block','estructura'], now() - interval '72 hours',
   2, 'Análisis Técnico y Price Action', 1),

  ('cl_004', 'Gestión de riesgo: nunca pierdas tu cuenta',
   'Tamaño de posición, ratio riesgo/beneficio, y cómo sobrevivir a una racha de pérdidas sin reventar tu capital.',
   'Gestión de Riesgo', 'Principiante',
   'https://www.youtube.com/watch?v=Nb2x4mAvLZA',
   'https://www.youtube.com/embed/Nb2x4mAvLZA?rel=0&modestbranding=1',
   'https://i.ytimg.com/vi/Nb2x4mAvLZA/hqdefault.jpg',
   31, 'Angel Hurtado', ARRAY['riesgo','money management'], now() - interval '108 hours',
   3, 'Gestión y Psicología', 1),

  ('cl_005', 'Psicología del trader: controla el miedo y la avaricia',
   'Rutinas, journaling y mentalidad para operar con disciplina y dejar de sabotear tus propios setups.',
   'Psicología', 'Intermedio',
   'https://www.youtube.com/watch?v=6_b7RDuLwcI',
   'https://www.youtube.com/embed/6_b7RDuLwcI?rel=0&modestbranding=1',
   'https://i.ytimg.com/vi/6_b7RDuLwcI/hqdefault.jpg',
   27, 'Angel Hurtado', ARRAY['mentalidad','disciplina'], now() - interval '144 hours',
   3, 'Gestión y Psicología', 2),

  ('cl_006', 'Operando Bitcoin: setups en temporalidad alta',
   'Análisis de BTC en 4H y diario, niveles macro y cómo planificar entradas swing en cripto.',
   'Cripto', 'Avanzado',
   'https://www.youtube.com/watch?v=l1F2dvk3xCc',
   'https://www.youtube.com/embed/l1F2dvk3xCc?rel=0&modestbranding=1',
   'https://i.ytimg.com/vi/l1F2dvk3xCc/hqdefault.jpg',
   44, 'Angel Hurtado', ARRAY['btc','swing','cripto'], now() - interval '180 hours',
   4, 'Operativa en Mercados Reales', 1),

  ('cl_007', 'Sesión en vivo: análisis del mercado de la semana',
   'Repaso en directo de los pares principales, oportunidades de la semana y preguntas de la comunidad.',
   'En Vivo', 'Intermedio',
   'https://www.youtube.com/watch?v=jNQXAC9IVRw',
   'https://www.youtube.com/embed/jNQXAC9IVRw?rel=0&modestbranding=1',
   'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg',
   68, 'Angel Hurtado', ARRAY['en vivo','análisis semanal'], now() - interval '216 hours',
   0, '', 0),

  ('cl_008', 'Forex: las 3 sesiones y cómo aprovechar la volatilidad',
   'Londres, Nueva York y Asia: a qué hora operar cada par y cómo planificar tu jornada según la sesión.',
   'Forex', 'Intermedio',
   'https://www.youtube.com/watch?v=rfscVS0vtbw',
   'https://www.youtube.com/embed/rfscVS0vtbw?rel=0&modestbranding=1',
   'https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg',
   35, 'Angel Hurtado', ARRAY['forex','sesiones'], now() - interval '252 hours',
   2, 'Análisis Técnico y Price Action', 2)
on conflict (id) do nothing;
